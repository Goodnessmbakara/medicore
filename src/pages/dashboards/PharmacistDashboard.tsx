import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Pill, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Shield,
  LogOut,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

interface Supply {
  id: number;
  drug_name: string;
  quantity: number;
  batch_id?: string;
  expiry_date?: string;
  unit_price?: number;
  supplier?: string;
  updated_at: string;
  updated_by_name?: string;
}

interface Prescription {
  id: number;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  drug_name: string;
  dosage: string;
  instructions?: string;
  quantity: number;
  status: string;
  created_at: string;
}

// Mock data for demo
const mockSupplies: Supply[] = [
  {
    id: 1,
    drug_name: 'Paracetamol',
    quantity: 150,
    batch_id: 'PAR001',
    expiry_date: '2025-12-31',
    unit_price: 0.50,
    supplier: 'PharmaCorp',
    updated_at: new Date().toISOString(),
    updated_by_name: 'Michael Brown'
  },
  {
    id: 2,
    drug_name: 'Ibuprofen',
    quantity: 25,
    batch_id: 'IBU002',
    expiry_date: '2025-06-30',
    unit_price: 0.75,
    supplier: 'MediSupply',
    updated_at: new Date().toISOString(),
    updated_by_name: 'Michael Brown'
  },
  {
    id: 3,
    drug_name: 'Amoxicillin',
    quantity: 80,
    batch_id: 'AMX003',
    expiry_date: '2025-09-15',
    unit_price: 1.25,
    supplier: 'PharmaCorp',
    updated_at: new Date().toISOString(),
    updated_by_name: 'Michael Brown'
  }
];

const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patient_id: 'P000001',
    patient_name: 'John Doe',
    doctor_name: 'Dr. John Smith',
    drug_name: 'Paracetamol',
    dosage: '500mg',
    instructions: 'Take twice daily with food',
    quantity: 20,
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    patient_id: 'P000002',
    patient_name: 'Jane Smith',
    doctor_name: 'Dr. John Smith',
    drug_name: 'Ibuprofen',
    dosage: '400mg',
    instructions: 'Take as needed for pain',
    quantity: 10,
    status: 'verified',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

const PharmacistDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [activeTab, setActiveTab] = useState('supplies');
  const [supplies, setSupplies] = useState<Supply[]>(mockSupplies);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [verificationPin, setVerificationPin] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [newSupply, setNewSupply] = useState({
    drugName: '',
    quantity: '',
    batchId: '',
    expiryDate: '',
    unitPrice: '',
    supplier: ''
  });

  const tabs = [
    { id: 'supplies', label: 'Supplies', icon: Package },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
  ];

  const handleAddSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSupplyData: Supply = {
      id: supplies.length + 1,
      drug_name: newSupply.drugName,
      quantity: parseInt(newSupply.quantity),
      batch_id: newSupply.batchId || undefined,
      expiry_date: newSupply.expiryDate || undefined,
      unit_price: newSupply.unitPrice ? parseFloat(newSupply.unitPrice) : undefined,
      supplier: newSupply.supplier || undefined,
      updated_at: new Date().toISOString(),
      updated_by_name: user?.fullName
    };
    
    setSupplies(prev => [...prev, newSupplyData]);
    toast.success('Supply added successfully');
    setShowAddSupplyModal(false);
    setNewSupply({
      drugName: '',
      quantity: '',
      batchId: '',
      expiryDate: '',
      unitPrice: '',
      supplier: ''
    });
  };

  const handleVerifyPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    if (verificationPin !== '4567') {
      toast.error('Invalid PIN. Use 4567 for demo.');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPrescriptions(prev => prev.map(p => 
      p.id === selectedPrescription.id 
        ? { ...p, status: 'verified' }
        : p
    ));
    
    toast.success('Prescription verified successfully');
    setShowVerifyModal(false);
    setSelectedPrescription(null);
    setVerificationPin('');
  };

  const handleDispensePrescription = async (prescriptionId: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionId 
        ? { ...p, status: 'dispensed' }
        : p
    ));
    
    toast.success('Prescription dispensed successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispensed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLowStockSupplies = () => {
    return supplies.filter(supply => supply.quantity < 50);
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
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Welcome back, {user?.fullName}</p>
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
                              ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-700'
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

                {/* Low Stock Alert */}
                {getLowStockSupplies().length > 0 && (
                  <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Low Stock Alert</span>
                    </div>
                    <p className="text-xs text-red-700">
                      {getLowStockSupplies().length} items running low
                    </p>
                  </div>
                )}
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
                          ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-700'
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

            {/* Low Stock Alert */}
            {getLowStockSupplies().length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Low Stock Alert</span>
                </div>
                <p className="text-xs text-red-700">
                  {getLowStockSupplies().length} items running low
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'supplies' && (
            <div className="space-y-4 sm: space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Medication Supplies</h2>
                <button
                  onClick={() => setShowAddSupplyModal(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Supply</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Drug Name
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch ID
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {supplies.map((supply) => (
                        <tr key={supply.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {supply.drug_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={supply.quantity < 50 ? 'text-red-600 font-semibold' : ''}>
                              {supply.quantity}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {supply.batch_id || '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {supply.expiry_date ? new Date(supply.expiry_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {supply.quantity < 50 ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Prescription Management</h2>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescriptions.map((prescription) => (
                        <tr key={prescription.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.patient_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {prescription.patient_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.doctor_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {prescription.drug_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.dosage}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prescription.quantity}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(prescription.status)}`}>
                              {prescription.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                              {prescription.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    setSelectedPrescription(prescription);
                                    setShowVerifyModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {prescription.status === 'verified' && (
                                <button
                                  onClick={() => handleDispensePrescription(prescription.id)}
                                  className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-xs sm:text-sm"
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>Dispense</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sales Management</h2>
              
              <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Sales Dashboard</h3>
                <p className="text-sm sm:text-base text-gray-600">Track medication sales and revenue here.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Supply Modal */}
      {showAddSupplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Supply</h2>
            </div>
            <form onSubmit={handleAddSupply} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name *</label>
                <input
                  type="text"
                  value={newSupply.drugName}
                  onChange={(e) => setNewSupply({ ...newSupply, drugName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={newSupply.quantity}
                  onChange={(e) => setNewSupply({ ...newSupply, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
                <input
                  type="text"
                  value={newSupply.batchId}
                  onChange={(e) => setNewSupply({ ...newSupply, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newSupply.expiryDate}
                  onChange={(e) => setNewSupply({ ...newSupply, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  value={newSupply.unitPrice}
                  onChange={(e) => setNewSupply({ ...newSupply, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={newSupply.supplier}
                  onChange={(e) => setNewSupply({ ...newSupply, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSupplyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
                >
                  Add Supply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Prescription Modal */}
      {showVerifyModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Verify Prescription</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedPrescription.drug_name} for {selectedPrescription.patient_name}
              </p>
            </div>
            <form onSubmit={handleVerifyPrescription} className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Prescription Details</h3>
                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                  <p><strong>Patient:</strong> {selectedPrescription.patient_name}</p>
                  <p><strong>Doctor:</strong> {selectedPrescription.doctor_name}</p>
                  <p><strong>Medication:</strong> {selectedPrescription.drug_name}</p>
                  <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                  <p><strong>Quantity:</strong> {selectedPrescription.quantity}</p>
                  {selectedPrescription.instructions && (
                    <p><strong>Instructions:</strong> {selectedPrescription.instructions}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your PIN to verify *
                </label>
                <input
                  type="password"
                  value={verificationPin}
                  onChange={(e) => setVerificationPin(e.target.value.slice(0, 4))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center tracking-widest text-sm sm:text-base"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Demo PIN: 4567</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedPrescription(null);
                    setVerificationPin('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verificationPin.length !== 4}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Shield className="w-4 h-4" />
                  <span>Verify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;