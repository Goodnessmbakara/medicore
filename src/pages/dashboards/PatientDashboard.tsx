import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Activity, 
  UserCheck,
  Clock,
  LogOut,
  Send,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Appointment {
  id: number;
  doctor_name: string;
  appointment_date: string;
  status: string;
  urgency: string;
  notes?: string;
}

interface MedicalRecord {
  id: number;
  record_type: string;
  diagnosis?: string;
  symptoms?: string;
  notes?: string;
  created_at: string;
  created_by_name?: string;
  created_by_role?: string;
}

// Mock data for demo
const mockAppointments: Appointment[] = [
  {
    id: 1,
    doctor_name: 'Dr. John Smith',
    appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'scheduled',
    urgency: 'moderate',
    notes: 'Follow-up consultation'
  },
  {
    id: 2,
    doctor_name: 'Dr. Sarah Wilson',
    appointment_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    status: 'scheduled',
    urgency: 'low',
    notes: 'Routine checkup'
  }
];

const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    record_type: 'consultation',
    diagnosis: 'Common cold',
    symptoms: 'Cough, runny nose, mild fever',
    notes: 'Prescribed rest and fluids',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by_name: 'Dr. John Smith',
    created_by_role: 'doctor'
  },
  {
    id: 2,
    record_type: 'diagnostics',
    symptoms: 'Headache, fatigue',
    notes: 'Blood pressure normal, temperature 36.8°C',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    created_by_name: 'Sarah Johnson',
    created_by_role: 'nurse'
  }
];

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(mockMedicalRecords);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [doctorRequest, setDoctorRequest] = useState({
    reason: '',
    preferredDate: '',
    symptoms: '',
    painScale: 0
  });

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'request', label: 'Doctor Request', icon: UserCheck },
  ];

  const handleSubmitDoctorRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Doctor request submitted successfully (Demo)');
    setDoctorRequest({
      reason: '',
      preferredDate: '',
      symptoms: '',
      painScale: 0
    });
  };

  const handleSubmitDiagnostics = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Diagnostics submitted successfully (Demo)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Patient Portal</h1>
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
                              ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
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
                          ? 'bg-green-50 text-green-700 border-r-2 border-green-700'
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
          {activeTab === 'appointments' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Appointments</h2>

              <div className="space-y-3 sm:space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {appointment.doctor_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                        {appointment.notes && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(appointment.urgency)}`}>
                          {appointment.urgency.toUpperCase()}
                        </span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                    <p className="text-sm sm:text-base text-gray-600">Your upcoming appointments will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Medical Records</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 capitalize text-sm sm:text-base">{record.record_type}</h3>
                          <span className="text-xs text-gray-500">
                            by {record.created_by_name} ({record.created_by_role})
                          </span>
                        </div>
                        {record.diagnosis && (
                          <p className="text-xs sm:text-sm text-gray-700 mb-1">
                            <strong>Diagnosis:</strong> {record.diagnosis}
                          </p>
                        )}
                        {record.symptoms && (
                          <p className="text-xs sm:text-sm text-gray-700 mb-1">
                            <strong>Symptoms:</strong> {record.symptoms}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs sm:text-sm text-gray-700">
                            <strong>Notes:</strong> {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {medicalRecords.length === 0 && (
                  <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No medical records</h3>
                    <p className="text-sm sm:text-base text-gray-600">Your medical history will be displayed here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Submit Diagnostics</h2>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmitDiagnostics} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Symptoms
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                      rows={4}
                      placeholder="Describe your current symptoms..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Scale (0-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-gray-900 w-8">0</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>No pain</span>
                      <span>Severe pain</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                      rows={3}
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Submit Diagnostics</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'request' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Request Doctor Consultation</h2>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmitDoctorRequest} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Consultation *
                    </label>
                    <textarea
                      value={doctorRequest.reason}
                      onChange={(e) => setDoctorRequest({ ...doctorRequest, reason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                      rows={4}
                      placeholder="Please describe the reason for your consultation request..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={doctorRequest.preferredDate}
                      onChange={(e) => setDoctorRequest({ ...doctorRequest, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Symptoms
                    </label>
                    <textarea
                      value={doctorRequest.symptoms}
                      onChange={(e) => setDoctorRequest({ ...doctorRequest, symptoms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                      rows={3}
                      placeholder="Describe any symptoms you're experiencing..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Level (0-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={doctorRequest.painScale}
                        onChange={(e) => setDoctorRequest({ ...doctorRequest, painScale: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-gray-900 w-8">
                        {doctorRequest.painScale}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>No pain</span>
                      <span>Severe pain</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Estimated Wait Time</span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                      Based on current queue, estimated wait time is 2-4 hours for non-urgent requests.
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Submit Request</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;