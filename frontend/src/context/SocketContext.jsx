import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // API_BASE_URL is usually http://localhost:5000/api
    // We need the base URL without /api for Socket.io
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'], // Force WebSocket to avoid polling 404s
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket Connection Error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
