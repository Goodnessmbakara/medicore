import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, pin: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo credentials for frontend-only deployment
const demoCredentials = {
  admin: { 
    password: 'admin123', 
    pin: '1234',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@medicore.com',
      role: 'admin',
      fullName: 'System Administrator'
    }
  },
  doctor1: { 
    password: 'doctor123', 
    pin: '2345',
    user: {
      id: 2,
      username: 'doctor1',
      email: 'doctor1@medicore.com',
      role: 'doctor',
      fullName: 'Dr. John Smith'
    }
  },
  nurse1: { 
    password: 'nurse123', 
    pin: '3456',
    user: {
      id: 3,
      username: 'nurse1',
      email: 'nurse1@medicore.com',
      role: 'nurse',
      fullName: 'Sarah Johnson'
    }
  },
  pharmacist1: { 
    password: 'pharmacy123', 
    pin: '4567',
    user: {
      id: 4,
      username: 'pharmacist1',
      email: 'pharmacist1@medicore.com',
      role: 'pharmacist',
      fullName: 'Michael Brown'
    }
  },
  patient1: { 
    password: 'patient123', 
    pin: '5678',
    user: {
      id: 5,
      username: 'patient1',
      email: 'patient1@medicore.com',
      role: 'patient',
      fullName: 'John Patient'
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('demo_token'));

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, decode the "token" which is just the username
        const username = atob(token);
        const demoUser = Object.values(demoCredentials).find(cred => cred.user.username === username);
        
        if (demoUser) {
          setUser(demoUser.user);
          console.log('User authenticated:', demoUser.user);
        } else {
          localStorage.removeItem('demo_token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('demo_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = async (username: string, password: string, pin: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const demoUser = demoCredentials[username as keyof typeof demoCredentials];
      
      if (!demoUser || demoUser.password !== password || demoUser.pin !== pin) {
        toast.error('Invalid credentials. Please check the demo credentials in the login modal.');
        return false;
      }

      // Create a simple "token" (just base64 encoded username for demo)
      const demoToken = btoa(username);
      
      localStorage.setItem('demo_token', demoToken);
      setToken(demoToken);
      setUser(demoUser.user);
      
      toast.success(`Welcome back, ${demoUser.user.fullName}!`);
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('Login successful, user set:', demoUser.user);
      }, 100);
      
      return true;
    } catch (error: any) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('demo_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};