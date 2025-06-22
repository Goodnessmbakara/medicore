import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import NurseDashboard from './pages/dashboards/NurseDashboard';
import PharmacistDashboard from './pages/dashboards/PharmacistDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import LoadingSpinner from './components/LoadingSpinner';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'pharmacist':
      return <PharmacistDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <DashboardRouter /> : <Navigate to="/" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#38A169',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#E53E3E',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;