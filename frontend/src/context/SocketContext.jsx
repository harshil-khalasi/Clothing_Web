import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Use same dynamic logic as api.js for socket base URL
    const getBaseUrl = () => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl) return apiUrl.replace('/api', '');
      return `http://${window.location.hostname}:5000`;
    };

    const socketUrl = getBaseUrl();
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
