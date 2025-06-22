import React, { useState } from "react";
import {
  Heart,
  Shield,
  Users,
  Clock,
  UserCheck,
  Stethoscope,
  Pill,
  UserPlus,
  Settings,
  Menu,
  X,
} from "lucide-react";
import LoginModal from "../components/LoginModal";

const LandingPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roles = [
    {
      id: "patient",
      title: "Patient Portal",
      description:
        "Access your medical records, book appointments, and communicate with healthcare providers.",
      icon: UserPlus,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "doctor",
      title: "Doctor Portal",
      description:
        "Manage patient queue, review records, create prescriptions, and schedule appointments.",
      icon: Stethoscope,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "nurse",
      title: "Nurse Portal",
      description:
        "Register patients, update profiles, record diagnostics, and coordinate care.",
      icon: UserCheck,
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      id: "pharmacist",
      title: "Pharmacist Portal",
      description:
        "Manage medication supplies, verify prescriptions, and process dispensations.",
      icon: Pill,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "admin",
      title: "Admin Portal",
      description:
        "Oversee hospital operations, manage users, and access comprehensive reports.",
      icon: Settings,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description:
        "HIPAA-compliant security with end-to-end encryption and multi-factor authentication.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Tailored dashboards for patients, doctors, nurses, pharmacists, and administrators.",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Instant notifications and live updates across all connected devices and users.",
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  MediCore
                </h1>
                <p className="text-xs sm:text-sm text-blue-600 font-medium hidden sm:block">
                  Your Health, Optimized
                </p>
              </div>
            </div>

            {/* Desktop Sign In Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden sm:block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Streamlined Healthcare
            <span className="text-blue-600 block">Management System</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Empower healthcare professionals and patients with a comprehensive,
            secure, and user-friendly platform designed for modern medical
            practice management.
          </p>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group active:scale-95"
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 ${role.color} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-transform group-hover:scale-110`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-base sm:text-lg font-semibold">
                  MediCore
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming healthcare management with secure, efficient, and
                user-friendly solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    HIPAA Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 MediCore. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setSelectedRole("");
        }}
        defaultRole={selectedRole}
      />
    </div>
  );
};

export default LandingPage;
