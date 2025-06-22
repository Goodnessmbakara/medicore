import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Presentation as Prescription, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Send,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

interface QueueItem {
  id: number;
  patient_id: string;
  patient_name: string;
  urgency: 'low' | 'moderate' | 'high';
  appointment_date: string;
  notes?: string;
}

interface Appointment {
  id: number;
  patient_id: string;
  patient_name: string;
  appointment_date: string;
  status: string;
  urgency: string;
}

// Mock data for demo
const mockQueue: QueueItem[] = [
  {
    id: 1,
    patient_id: 'P000001',
    patient_name: 'John Doe',
    urgency: 'high',
    appointment_date: new Date().toISOString(),
    notes: 'Chest pain, requires immediate attention'
  },
  {
    id: 2,
    patient_id: 'P000002',
    patient_name: 'Jane Smith',
    urgency: 'moderate',
    appointment_date: new Date(Date.now() + 3600000).toISOString(),
    notes: 'Follow-up consultation'
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 'P000001',
    patient_name: 'John Doe',
    appointment_date: new Date().toISOString(),
    status: 'scheduled',
    urgency: 'high'
  },
  {
    id: 2,
    patient_id: 'P000002',
    patient_name: 'Jane Smith',
    appointment_date: new Date(Date.now() + 3600000).toISOString(),
    status: 'scheduled',
    urgency: 'moderate'
  }
];

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueue] = useState<QueueItem[]>(mockQueue);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [prescription, setPrescription] = useState({
    drugName: '',
    dosage: '',
    instructions: '',
    quantity: 1,
    pin: ''
  });

  const tabs = [
    { id: 'queue', label: 'Patient Queue', icon: Clock },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: Prescription },
  ];

  const handleAcceptAppointment = async (appointmentId: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueue(prev => prev.filter(item => item.id !== appointmentId));
    toast.success('Appointment accepted');
  };

  const handleDeclineAppointment = async (appointmentId: number) => {
    const reason = prompt('Please provide a reason for declining:');
    if (!reason) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueue(prev => prev.filter(item => item.id !== appointmentId));
    toast.success('Appointment declined');
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Prescription created successfully (Demo)');
    setShowPrescriptionModal(false);
    setPrescription({
      drugName: '',
      dosage: '',
      instructions: '',
      quantity: 1,
      pin: ''
    });
    setSelectedPatient(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Welcome back, Dr. {user?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
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
          {activeTab === 'queue' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Patient Queue</h2>
                <div className="text-sm text-gray-600">
                  {queue.length} patients waiting
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {queue.map((item) => (
                  <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.patient_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Patient ID: {item.patient_id}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(item.appointment_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(item.urgency)}`}>
                          {item.urgency.toUpperCase()}
                        </span>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleAcceptAppointment(item.id)}
                            className="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleDeclineAppointment(item.id)}
                            className="flex-1 sm:flex-none bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                          >
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-700">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {queue.length === 0 && (
                  <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No patients in queue</h3>
                    <p className="text-sm sm:text-base text-gray-600">All caught up! New appointments will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Appointments</h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patient_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.patient_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(appointment.appointment_date).toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                              {appointment.urgency}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedPatient(appointment);
                                setShowPrescriptionModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <Prescription className="w-4 h-4" />
                              <span className="hidden sm:inline">Prescribe</span>
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

          {(activeTab === 'prescriptions' || activeTab === 'records') && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {activeTab === 'prescriptions' ? 'Prescription Management' : 'Recent Records'}
              </h2>
              <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Prescription className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Demo Mode</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {activeTab === 'prescriptions' 
                    ? 'View and manage your prescriptions here.' 
                    : 'Patient medical records would be displayed here.'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Prescription</h2>
              <p className="text-sm text-gray-600 mt-1">
                Patient: {selectedPatient.patient_name} ({selectedPatient.patient_id})
              </p>
            </div>
            <form onSubmit={handleCreatePrescription} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name</label>
                <input
                  type="text"
                  value={prescription.drugName}
                  onChange={(e) => setPrescription({ ...prescription, drugName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={prescription.dosage}
                  onChange={(e) => setPrescription({ ...prescription, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={prescription.quantity}
                  onChange={(e) => setPrescription({ ...prescription, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea
                  value={prescription.instructions}
                  onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  rows={3}
                  placeholder="Take twice daily with food..."
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setSelectedPatient(null);
                    setPrescription({
                      drugName: '',
                      dosage: '',
                      instructions: '',
                      quantity: 1,
                      pin: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Pharmacist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;