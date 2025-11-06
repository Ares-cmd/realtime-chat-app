const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);

    // Update user status and socket ID
    await User.findByIdAndUpdate(socket.user._id, {
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date()
    });

    // Join user's chat rooms
    const userChats = await Chat.find({ participants: socket.user._id });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Notify others that user is online
    socket.broadcast.emit('user_online', {
      userId: socket.user._id,
      socketId: socket.id
    });

    // Join chat room
    socket.on('join_chat', async ({ chatId }) => {
      try {
        socket.join(chatId);
        console.log(`User ${socket.user.name} joined chat: ${chatId}`);
        
        socket.to(chatId).emit('user_joined_chat', {
          userId: socket.user._id,
          name: socket.user.name,
          chatId
        });
      } catch (error) {
        socket.emit('error', { message: 'Error joining chat' });
      }
    });

    // Broadcast message (message already created via HTTP API)
    socket.on('send_message', async (data) => {
      try {
        const { chatId, messageId } = data;

        // Fetch the already-created message and broadcast it
        const populatedMessage = await Message.findById(messageId)
          .populate('sender', 'name avatar email');

        if (populatedMessage) {
          // Emit to all users in the chat room
          io.to(chatId).emit('new_message', populatedMessage);
        }

      } catch (error) {
        socket.emit('error', { message: 'Error broadcasting message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name,
        chatId
      });
    });

    // Stop typing indicator
    socket.on('stop_typing', ({ chatId }) => {
      socket.to(chatId).emit('user_stop_typing', {
        userId: socket.user._id,
        chatId
      });
    });

    // Mark message as read
    socket.on('read_message', async ({ messageId, chatId }) => {
      try {
        const message = await Message.findById(messageId);
        
        if (message) {
          const alreadyRead = message.readBy.some(
            r => r.user.toString() === socket.user._id.toString()
          );

          if (!alreadyRead) {
            message.readBy.push({
              user: socket.user._id,
              readAt: new Date()
            });
            await message.save();

            io.to(chatId).emit('message_read', {
              messageId,
              userId: socket.user._id
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Error marking message as read' });
      }
    });

    // Leave chat room
    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(chatId);
      socket.to(chatId).emit('user_left_chat', {
        userId: socket.user._id,
        name: socket.user.name,
        chatId
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);

      // Update user status
      await User.findByIdAndUpdate(socket.user._id, {
        status: 'offline',
        lastSeen: new Date(),
        socketId: null
      });

      // Notify others that user is offline
      socket.broadcast.emit('user_offline', {
        userId: socket.user._id
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

