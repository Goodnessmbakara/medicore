import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

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

// Demo credentials for fallback
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token') || localStorage.getItem('demo_token'));

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to validate with real API first
        const response = await authAPI.validate();
        setUser(response.user);
        console.log('User authenticated via API:', response.user);
      } catch (error) {
        console.log('API validation failed, trying demo token...');
        
        // Fallback to demo token validation
        try {
          const username = atob(token);
          const demoUser = Object.values(demoCredentials).find(cred => cred.user.username === username);
          
          if (demoUser) {
            setUser(demoUser.user);
            console.log('User authenticated via demo:', demoUser.user);
          } else {
            localStorage.removeItem('demo_token');
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (demoError) {
          console.error('Demo token validation failed:', demoError);
          localStorage.removeItem('demo_token');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const login = async (username: string, password: string, pin: string): Promise<boolean> => {
    try {
      // Try real API login first
      const response = await authAPI.login(username, password, pin);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.removeItem('demo_token'); // Clear any demo token
      setToken(response.token);
      setUser(response.user);
      
      toast.success(`Welcome back, ${response.user.fullName}!`);
      console.log('Login successful via API:', response.user);
      
      return true;
    } catch (error: any) {
      console.log('API login failed, trying demo credentials...');
      
      // Fallback to demo credentials
      const demoUser = demoCredentials[username as keyof typeof demoCredentials];
      
      if (!demoUser || demoUser.password !== password || demoUser.pin !== pin) {
        toast.error('Invalid credentials. Please check your username, password, and PIN.');
        return false;
      }

      // Create a simple "token" (just base64 encoded username for demo)
      const demoToken = btoa(username);
      
      localStorage.setItem('demo_token', demoToken);
      localStorage.removeItem('auth_token'); // Clear any real token
      setToken(demoToken);
      setUser(demoUser.user);
      
      toast.success(`Welcome back, ${demoUser.user.fullName}! (Demo Mode)`);
      console.log('Login successful via demo:', demoUser.user);
      
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
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