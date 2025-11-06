import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSend, FiMoreVertical } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Message from './Message';
import '../styles/ChatWindow.css';

const ChatWindow = ({ chat, onChatUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    if (chat) {
      fetchMessages();
      joinChat();
    }
  }, [chat]);

  useEffect(() => {
    if (socket && chat) {
      socket.on('new_message', (message) => {
        if (message.chat === chat._id) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      socket.on('message_deleted', ({ chatId, messageId }) => {
        if (chatId === chat._id) {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      });

      socket.on('user_typing', ({ chatId, user: typingUser }) => {
        if (chatId === chat._id && typingUser._id !== user._id) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('message_deleted');
        socket.off('user_typing');
      };
    }
  }, [socket, chat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/messages/${chat._id}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChat = () => {
    if (socket && chat) {
      socket.emit('join_chat', {
        chatId: chat._id,
        userId: user._id,
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await axios.post('/api/messages', {
        chatId: chat._id,
        content: messageContent,
        type: 'text',
      });

      const sentMessage = response.data.data;
      
      // Emit via socket
      if (socket) {
        socket.emit('send_message', {
          chatId: chat._id,
          messageId: sentMessage._id,
        });
      }

      onChatUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleTyping = () => {
    if (socket && chat) {
      socket.emit('typing', {
        chatId: chat._id,
        userId: user._id,
      });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      
      if (socket) {
        socket.emit('delete_message', {
          chatId: chat._id,
          messageId,
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getChatName = () => {
    if (!chat) return '';
    if (chat.type === 'group') return chat.name;
    const otherMember = chat.members.find((m) => m._id !== user._id);
    return otherMember?.username || 'Unknown';
  };

  const isUserOnline = () => {
    if (!chat || chat.type === 'group') return false;
    const otherMember = chat.members.find((m) => m._id !== user._id);
    return onlineUsers.includes(otherMember?._id);
  };

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <h2>💬</h2>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-info">
          <div className="chat-avatar">
            {getChatName().charAt(0).toUpperCase()}
            {isUserOnline() && <span className="online-indicator" />}
          </div>
          <div>
            <div className="chat-name">{getChatName()}</div>
            <div className="chat-status">
              {isUserOnline() ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <button className="btn-more">
          <FiMoreVertical />
        </button>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message
                key={message._id}
                message={message}
                isOwn={message.sender._id === user._id}
                onDelete={handleDeleteMessage}
              />
            ))}
            {typing && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleTyping}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={!newMessage.trim()}
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

