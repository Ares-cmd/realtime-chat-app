import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('user_online', (userId) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      });

      newSocket.on('user_offline', (userId) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, token]);

  const value = {
    socket,
    onlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

