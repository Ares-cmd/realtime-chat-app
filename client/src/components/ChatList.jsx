import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import '../styles/ChatList.css';

const ChatList = ({ chats, selectedChat, onSelectChat, onNewChat, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (showNewChat) {
      fetchUsers();
    }
  }, [showNewChat]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      // Filter out current user
      const filteredUsers = response.data.data.filter((u) => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const chatName = getChatName(chat);
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatName = (chat) => {
    if (chat.type === 'group') {
      return chat.name;
    }
    const otherMember = chat.members.find((m) => m._id !== user._id);
    return otherMember?.username || 'Unknown';
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'group') {
      return chat.name.charAt(0).toUpperCase();
    }
    const otherMember = chat.members.find((m) => m._id !== user._id);
    return otherMember?.username?.charAt(0).toUpperCase() || '?';
  };

  const isUserOnline = (chat) => {
    if (chat.type === 'group') return false;
    const otherMember = chat.members.find((m) => m._id !== user._id);
    return onlineUsers.includes(otherMember?._id);
  };

  const handleUserClick = (userId) => {
    onNewChat(userId);
    setShowNewChat(false);
  };

  if (loading) {
    return (
      <div className="chat-list">
        <div className="loading">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <button
          className="btn-new-chat"
          onClick={() => setShowNewChat(!showNewChat)}
          title="New Chat"
        >
          <FiPlus />
        </button>
      </div>

      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showNewChat && (
        <div className="new-chat-modal">
          <div className="modal-header">
            <h3>Start New Chat</h3>
            <button onClick={() => setShowNewChat(false)}>×</button>
          </div>
          <div className="users-list">
            {users.map((u) => (
              <div
                key={u._id}
                className="user-item"
                onClick={() => handleUserClick(u._id)}
              >
                <div className="user-avatar">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{u.username}</div>
                  <div className="user-email">{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chats-container">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>No chats yet</p>
            <button onClick={() => setShowNewChat(true)} className="btn-primary">
              Start a conversation
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="chat-avatar">
                {getChatAvatar(chat)}
                {isUserOnline(chat) && <span className="online-indicator" />}
              </div>
              <div className="chat-info">
                <div className="chat-header-row">
                  <div className="chat-name">{getChatName(chat)}</div>
                  {chat.lastMessage && (
                    <div className="chat-time">
                      {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                        addSuffix: false,
                      })}
                    </div>
                  )}
                </div>
                <div className="chat-last-message">
                  {chat.lastMessage
                    ? chat.lastMessage.content
                    : 'No messages yet'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

