import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  Pill, 
  Activity,
  Search,
  Plus,
  Eye,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserStats {
  role: string;
  count: number;
  active_count: number;
}

interface DoctorLog {
  full_name: string;
  action: string;
  created_at: string;
}

interface Patient {
  id: number;
  patient_id: string;
  full_name: string;
  age: number;
  last_visit: string;
}

// Mock data for demo
const mockUserStats: UserStats[] = [
  { role: 'admin', count: 1, active_count: 1 },
  { role: 'doctor', count: 3, active_count: 3 },
  { role: 'nurse', count: 5, active_count: 4 },
  { role: 'pharmacist', count: 2, active_count: 2 },
  { role: 'patient', count: 150, active_count: 142 }
];

const mockDoctorLogs: DoctorLog[] = [
  { full_name: 'Dr. John Smith', action: 'PRESCRIPTION_CREATED', created_at: new Date().toISOString() },
  { full_name: 'Dr. Sarah Wilson', action: 'APPOINTMENT_COMPLETED', created_at: new Date(Date.now() - 3600000).toISOString() },
  { full_name: 'Dr. Michael Chen', action: 'PATIENT_CONSULTATION', created_at: new Date(Date.now() - 7200000).toISOString() }
];

const mockPatients: Patient[] = [
  { id: 1, patient_id: 'P000001', full_name: 'John Doe', age: 35, last_visit: new Date().toISOString() },
  { id: 2, patient_id: 'P000002', full_name: 'Jane Smith', age: 28, last_visit: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, patient_id: 'P000003', full_name: 'Robert Johnson', age: 45, last_visit: new Date(Date.now() - 172800000).toISOString() }
];

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats[]>(mockUserStats);
  const [doctorLogs, setDoctorLogs] = useState<DoctorLog[]>(mockDoctorLogs);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    pin: '',
    role: 'nurse',
    fullName: ''
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'doctors', label: "Doctors", icon: Stethoscope },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'patients', label: 'Patients', icon: UserCheck },
  ];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('User added successfully (Demo)');
    setShowAddUserModal(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      pin: '',
      role: 'nurse',
      fullName: ''
    });
  };

  const getStatsByRole = (role: string) => {
    return userStats.find(stat => stat.role === role) || { count: 0, active_count: 0 };
  };

  const filteredPatients = patients.filter(patient => 
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Hospital Admin</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Welcome back, {user?.fullName}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <nav className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Doctors</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getStatsByRole('doctor').active_count}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Nurses</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getStatsByRole('nurse').active_count}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-teal-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Pharmacists</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getStatsByRole('pharmacist').active_count}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">Patients</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getStatsByRole('patient').active_count}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Doctor Logs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Doctor Activity</h2>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {doctorLogs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{log.full_name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{log.action}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Management</h2>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {userStats.map((stat) => (
                    <div key={stat.role} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{stat.role}s</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {stat.active_count} active of {stat.count} total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.active_count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Patient Records</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base w-full sm:w-auto"
                    placeholder="Search patients..."
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient ID
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Visit
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {patient.patient_id}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.full_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.age}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(patient.last_visit).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'pharmacy' || activeTab === 'doctors') && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {activeTab === 'pharmacy' ? 'Pharmacy Records' : "Doctors' Logs"}
              </h2>
              
              <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Demo Mode</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  This section would show detailed {activeTab === 'pharmacy' ? 'pharmacy records' : 'doctor activity logs'} in a full implementation.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New User</h2>
            </div>
            <form onSubmit={handleAddUser} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 digits)</label>
                <input
                  type="password"
                  value={newUser.pin}
                  onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.slice(0, 4) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  maxLength={4}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;