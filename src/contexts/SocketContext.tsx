import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: any | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // For demo purposes, simulate a connected socket
      console.log('Demo: WebSocket connection simulated');
      setConnected(true);

      // Simulate some demo notifications
      const demoNotifications = [
        { type: 'appointment_created', message: 'New appointment scheduled', delay: 3000 },
        { type: 'new_prescription', message: 'New prescription requires verification', delay: 8000 },
        { type: 'low_stock', message: 'Low stock alert: Ibuprofen (25 remaining)', delay: 15000 }
      ];

      const timeouts = demoNotifications.map(notification => 
        setTimeout(() => {
          if (user.role === 'doctor' && notification.type === 'appointment_created') {
            toast.success(notification.message, { icon: '📅' });
          } else if (user.role === 'pharmacist' && notification.type === 'new_prescription') {
            toast.info(notification.message, { icon: '💊' });
          } else if (user.role === 'pharmacist' && notification.type === 'low_stock') {
            toast.error(notification.message, { icon: '⚠️' });
          }
        }, notification.delay)
      );

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
        setConnected(false);
        console.log('Demo: WebSocket connection closed');
      };
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};