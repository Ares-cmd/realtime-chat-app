import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import Header from '../components/Header';
import '../styles/Chat.css';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        // Update chat list when new message arrives
        fetchChats();
        
        // Update selected chat if it's the current one
        if (selectedChat && message.chat === selectedChat._id) {
          setSelectedChat((prev) => ({
            ...prev,
            lastMessage: message,
          }));
        }
      });

      socket.on('message_deleted', ({ chatId, messageId }) => {
        if (selectedChat && chatId === selectedChat._id) {
          fetchChats();
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('message_deleted');
      };
    }
  }, [socket, selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chats');
      setChats(response.data.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleNewChat = async (userId) => {
    try {
      const response = await axios.post('/api/chats', {
        type: 'private',
        members: [userId],
      });
      const newChat = response.data.data;
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="chat-container">
      <Header />
      <div className="chat-content">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          loading={loading}
        />
        <ChatWindow
          chat={selectedChat}
          onChatUpdate={fetchChats}
        />
      </div>
    </div>
  );
};

export default Chat;

