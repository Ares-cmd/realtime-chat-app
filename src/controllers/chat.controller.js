const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Get all chats for logged in user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email avatar status')
    .populate('admin', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chats',
      error: error.message
    });
  }
};

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res) => {
  try {
    const { participantIds, name, isGroupChat } = req.body;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participants are required'
      });
    }

    // Add current user to participants
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

    // For group chat, name is required
    if (isGroupChat && !name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required for group chat'
      });
    }

    // Check if one-on-one chat already exists
    if (!isGroupChat && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: 2 }
      }).populate('participants', 'name email avatar status');

      if (existingChat) {
        return res.status(200).json({
          success: true,
          data: existingChat
        });
      }
    }

    // Create new chat
    const chat = await Chat.create({
      name,
      isGroupChat: isGroupChat || false,
      participants: allParticipants,
      admin: isGroupChat ? req.user._id : null
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email avatar status')
      .populate('admin', 'name email');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: populatedChat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating chat',
      error: error.message
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email avatar status')
      .populate('admin', 'name email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.find(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat',
      error: error.message
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Only admin can delete group chat
    if (chat.isGroupChat && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete group chat'
      });
    }

    // Delete all messages in chat
    await Message.deleteMany({ chat: chat._id });

    // Delete chat
    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting chat',
      error: error.message
    });
  }
};

// @desc    Add members to group chat
// @route   POST /api/chats/:id/members
// @access  Private
exports.addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: 'Can only add members to group chat'
      });
    }

    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can add members'
      });
    }

    // Add new members
    chat.participants = [...new Set([...chat.participants.map(p => p.toString()), ...userIds])];
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email avatar status')
      .populate('admin', 'name email');

    res.status(200).json({
      success: true,
      message: 'Members added successfully',
      data: updatedChat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding members',
      error: error.message
    });
  }
};

// @desc    Remove member from group chat
// @route   DELETE /api/chats/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({
        success: false,
        message: 'Can only remove members from group chat'
      });
    }

    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can remove members'
      });
    }

    // Remove member
    chat.participants = chat.participants.filter(p => p.toString() !== req.params.userId);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name email avatar status')
      .populate('admin', 'name email');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: updatedChat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
};

