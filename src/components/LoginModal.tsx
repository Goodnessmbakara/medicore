import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Lock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, defaultRole }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    pin: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(formData.username, formData.password, formData.pin);
    if (success) {
      onClose();
      setFormData({ username: '', password: '', pin: '' });
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pin') {
      // Only allow numbers and max 4 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Auto-fill demo credentials based on role
  const fillDemoCredentials = (role: string) => {
    const credentials = {
      admin: { username: 'admin', password: 'admin123', pin: '1234' },
      doctor: { username: 'doctor1', password: 'doctor123', pin: '2345' },
      nurse: { username: 'nurse1', password: 'nurse123', pin: '3456' },
      pharmacist: { username: 'pharmacist1', password: 'pharmacy123', pin: '4567' },
      patient: { username: 'patient1', password: 'patient123', pin: '5678' }
    };

    const cred = credentials[role as keyof typeof credentials];
    if (cred) {
      setFormData(cred);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Sign In to MediCore
            </h2>
            {defaultRole && (
              <p className="text-sm text-gray-600 mt-1">
                {defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)} Portal
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Security PIN
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="password"
                id="pin"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center tracking-widest text-sm sm:text-base"
                placeholder="••••"
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">4-digit security PIN</p>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.username || !formData.password || formData.pin.length !== 4}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="text-center text-sm text-gray-500">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-2 text-xs sm:text-sm">Demo Credentials - Tap to auto-fill:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="p-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors text-center"
                >
                  <strong className="block">Admin</strong>
                  <span className="text-xs">admin / admin123 / 1234</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('doctor')}
                  className="p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-center"
                >
                  <strong className="block">Doctor</strong>
                  <span className="text-xs">doctor1 / doctor123 / 2345</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('nurse')}
                  className="p-2 bg-teal-100 text-teal-800 rounded hover:bg-teal-200 transition-colors text-center"
                >
                  <strong className="block">Nurse</strong>
                  <span className="text-xs">nurse1 / nurse123 / 3456</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('pharmacist')}
                  className="p-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors text-center"
                >
                  <strong className="block">Pharmacist</strong>
                  <span className="text-xs">pharmacist1 / pharmacy123 / 4567</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('patient')}
                  className="p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors col-span-1 sm:col-span-2 text-center"
                >
                  <strong className="block">Patient</strong>
                  <span className="text-xs">patient1 / patient123 / 5678</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;