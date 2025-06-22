import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Edit, 
  Activity, 
  FileText, 
  Send,
  LogOut,
  Save,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  patient_id: string;
  full_name: string;
  age: number;
  weight?: number;
  allergies?: string;
  blood_pressure?: string;
  temperature?: number;
  emergency_contact?: string;
}

// Mock data for demo
const mockPatients: Patient[] = [
  {
    id: 1,
    patient_id: 'P000001',
    full_name: 'John Doe',
    age: 35,
    weight: 70.5,
    allergies: 'Penicillin',
    blood_pressure: '120/80',
    temperature: 36.5,
    emergency_contact: 'Jane Doe - 555-0123'
  },
  {
    id: 2,
    patient_id: 'P000002',
    full_name: 'Jane Smith',
    age: 28,
    weight: 65.0,
    allergies: 'None',
    blood_pressure: '118/75',
    temperature: 36.8,
    emergency_contact: 'John Smith - 555-0456'
  }
];

const NurseDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('register');
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    age: '',
    pin: '',
    emergencyContact: '',
    allergies: '',
    weight: '',
    temperature: '',
    bloodPressure: ''
  });

  const [diagnostics, setDiagnostics] = useState({
    weight: '',
    temperature: '',
    bloodPressure: '',
    symptoms: '',
    painScale: 0,
    notes: ''
  });

  const tabs = [
    { id: 'register', label: 'Register Patient', icon: UserPlus },
    { id: 'update', label: 'Update Profile', icon: Edit },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'records', label: 'Records', icon: FileText },
  ];

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPatientData: Patient = {
      id: patients.length + 1,
      patient_id: `P${String(patients.length + 1).padStart(6, '0')}`,
      full_name: newPatient.fullName,
      age: parseInt(newPatient.age),
      weight: newPatient.weight ? parseFloat(newPatient.weight) : undefined,
      allergies: newPatient.allergies,
      blood_pressure: newPatient.bloodPressure,
      temperature: newPatient.temperature ? parseFloat(newPatient.temperature) : undefined,
      emergency_contact: newPatient.emergencyContact
    };
    
    setPatients(prev => [...prev, newPatientData]);
    toast.success('Patient registered successfully');
    setNewPatient({
      fullName: '',
      age: '',
      pin: '',
      emergencyContact: '',
      allergies: '',
      weight: '',
      temperature: '',
      bloodPressure: ''
    });
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPatients(prev => prev.map(p => 
      p.id === selectedPatient.id ? selectedPatient : p
    ));
    toast.success('Patient updated successfully');
  };

  const handleAddDiagnostics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Diagnostics added successfully');
    setDiagnostics({
      weight: '',
      temperature: '',
      bloodPressure: '',
      symptoms: '',
      painScale: 0,
      notes: ''
    });
  };

  const validateTemperature = (temp: string) => {
    const temperature = parseFloat(temp);
    return temperature >= 35 && temperature <= 45;
  };

  const validateBloodPressure = (bp: string) => {
    return /^\d{2,3}\/\d{2,3}$/.test(bp);
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
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
                              ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
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
                          ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-700'
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
          {activeTab === 'register' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Register New Patient</h2>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleRegisterPatient} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newPatient.fullName}
                        onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        min="0"
                        max="120"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security PIN *
                      </label>
                      <input
                        type="password"
                        value={newPatient.pin}
                        onChange={(e) => setNewPatient({ ...newPatient, pin: e.target.value.slice(0, 4) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        placeholder="4-digit PIN"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={newPatient.emergencyContact}
                        onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={newPatient.weight}
                        onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={newPatient.temperature}
                        onChange={(e) => setNewPatient({ ...newPatient, temperature: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base ${
                          newPatient.temperature && !validateTemperature(newPatient.temperature)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        min="35"
                        max="45"
                        step="0.1"
                      />
                      {newPatient.temperature && !validateTemperature(newPatient.temperature) && (
                        <p className="text-red-600 text-xs mt-1">Temperature must be between 35°C and 45°C</p>
                      )}
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure
                      </label>
                      <input
                        type="text"
                        value={newPatient.bloodPressure}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodPressure: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base ${
                          newPatient.bloodPressure && !validateBloodPressure(newPatient.bloodPressure)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="120/80"
                      />
                      {newPatient.bloodPressure && !validateBloodPressure(newPatient.bloodPressure) && (
                        <p className="text-red-600 text-xs mt-1">Format: 120/80</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={newPatient.allergies}
                      onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                      rows={3}
                      placeholder="List any known allergies..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Register Patient</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'update' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update Patient Profile</h2>
              
              {/* Patient Search */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                      placeholder="Search by Patient ID or Name..."
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-teal-50 border-2 border-teal-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{patient.full_name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">ID: {patient.patient_id}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">Age: {patient.age}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Form */}
              {selectedPatient && (
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                    Update Profile: {selectedPatient.full_name}
                  </h3>
                  
                  <form onSubmit={handleUpdatePatient} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={selectedPatient.weight || ''}
                          onChange={(e) => setSelectedPatient({ 
                            ...selectedPatient, 
                            weight: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          value={selectedPatient.temperature || ''}
                          onChange={(e) => setSelectedPatient({ 
                            ...selectedPatient, 
                            temperature: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          min="35"
                          max="45"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Pressure
                        </label>
                        <input
                          type="text"
                          value={selectedPatient.blood_pressure || ''}
                          onChange={(e) => setSelectedPatient({ 
                            ...selectedPatient, 
                            blood_pressure: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          placeholder="120/80"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact
                        </label>
                        <input
                          type="text"
                          value={selectedPatient.emergency_contact || ''}
                          onChange={(e) => setSelectedPatient({ 
                            ...selectedPatient, 
                            emergency_contact: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies
                      </label>
                      <textarea
                        value={selectedPatient.allergies || ''}
                        onChange={(e) => setSelectedPatient({ 
                          ...selectedPatient, 
                          allergies: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        rows={3}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-teal-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Update Profile</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add Diagnostics</h2>
              
              {!selectedPatient ? (
                <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                  <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-sm sm:text-base text-gray-600">Go to "Update Profile" tab to select a patient first.</p>
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                    Diagnostics for: {selectedPatient.full_name}
                  </h3>
                  
                  <form onSubmit={handleAddDiagnostics} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={diagnostics.weight}
                          onChange={(e) => setDiagnostics({ ...diagnostics, weight: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature (°C)
                        </label>
                        <input
                          type="number"
                          value={diagnostics.temperature}
                          onChange={(e) => setDiagnostics({ ...diagnostics, temperature: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          min="35"
                          max="45"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Pressure
                        </label>
                        <input
                          type="text"
                          value={diagnostics.bloodPressure}
                          onChange={(e) => setDiagnostics({ ...diagnostics, bloodPressure: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          placeholder="120/80"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms
                      </label>
                      <textarea
                        value={diagnostics.symptoms}
                        onChange={(e) => setDiagnostics({ ...diagnostics, symptoms: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        rows={3}
                        placeholder="Describe patient symptoms..."
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
                          value={diagnostics.painScale}
                          onChange={(e) => setDiagnostics({ ...diagnostics, painScale: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-lg font-semibold text-gray-900 w-8">
                          {diagnostics.painScale}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={diagnostics.notes}
                        onChange={(e) => setDiagnostics({ ...diagnostics, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                        rows={4}
                        placeholder="Additional notes and observations..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-teal-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Save Diagnostics</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Patient Records</h2>
              
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
                          Last Updated
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {patient.patient_id}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.full_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Recently updated
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => toast.success('Record sent to doctor (Demo)')}
                              className="text-teal-600 hover:text-teal-800 flex items-center space-x-1"
                            >
                              <Send className="w-4 h-4" />
                              <span className="hidden sm:inline">Send to Doctor</span>
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
        </main>
      </div>
    </div>
  );
};

export default NurseDashboard;