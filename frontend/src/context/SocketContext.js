import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [connected, setConnected] = useState(false);
  const { currentUser, isAuthenticated } = useContext(AuthContext);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token || !isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      
      // Authenticate socket
      newSocket.emit('authenticate', token);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      setConnected(true);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error. Please refresh the page.');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // Listen for emergency alerts
  useEffect(() => {
    if (!socket || !connected || !currentUser) return;

    // Listen for new emergency alerts
    socket.on('emergencyAlert', (alert) => {
      console.log('New emergency alert received:', alert);
      
      setEmergencies((prev) => [alert, ...prev]);
      
      // Show notification
      toast.error(
        `New ${alert.type} emergency reported!`,
        {
          onClick: () => window.location.href = '/alerts'
        }
      );
    });

    // Listen for emergency cancellations
    socket.on('emergencyCancelled', (data) => {
      console.log('Emergency cancelled:', data);
      
      setEmergencies((prev) => 
        prev.map(emergency => 
          emergency.id === data.id 
            ? { ...emergency, status: 'CANCELLED', updatedAt: data.cancelledAt } 
            : emergency
        )
      );
      
      toast.info(`An emergency has been cancelled by the user.`);
    });

    // Listen for new advisories
    socket.on('newAdvisory', (advisory) => {
      console.log('New advisory posted:', advisory);
      toast.info(`New ${advisory.category}: ${advisory.title}`);
    });

    return () => {
      socket.off('emergencyAlert');
      socket.off('emergencyCancelled');
      socket.off('newAdvisory');
    };
  }, [socket, connected, currentUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        emergencies,
        setEmergencies
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 