import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string, pin: string) => {
    const response = await api.post('/api/auth/login', { username, password, pin });
    return response.data;
  },
  
  validate: async () => {
    const response = await api.get('/api/auth/validate');
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/api/users/stats');
    return response.data;
  },
  
  updateStatus: async (userId: number, isActive: boolean) => {
    const response = await api.patch(`/api/users/${userId}/status`, { is_active: isActive });
    return response.data;
  }
};

// Patients API
export const patientsAPI = {
  getAll: async (search?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/api/patients?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },
  
  register: async (patientData: any) => {
    const response = await api.post('/api/patients/register', patientData);
    return response.data;
  },
  
  update: async (id: number, patientData: any) => {
    const response = await api.put(`/api/patients/${id}`, patientData);
    return response.data;
  },
  
  addDiagnostics: async (id: number, diagnosticsData: any) => {
    const response = await api.post(`/api/patients/${id}/diagnostics`, diagnosticsData);
    return response.data;
  }
};

// Appointments API
export const appointmentsAPI = {
  getAll: async () => {
    const response = await api.get('/api/appointments');
    return response.data;
  },
  
  create: async (appointmentData: any) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/appointments/${id}/status`, { status });
    return response.data;
  },
  
  getQueue: async () => {
    const response = await api.get('/api/appointments/queue');
    return response.data;
  }
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: async () => {
    const response = await api.get('/api/prescriptions');
    return response.data;
  },
  
  create: async (prescriptionData: any) => {
    const response = await api.post('/api/prescriptions', prescriptionData);
    return response.data;
  },
  
  verify: async (id: number) => {
    const response = await api.patch(`/api/prescriptions/${id}/verify`);
    return response.data;
  },
  
  dispense: async (id: number) => {
    const response = await api.patch(`/api/prescriptions/${id}/dispense`);
    return response.data;
  }
};

// Supplies API
export const suppliesAPI = {
  getAll: async () => {
    const response = await api.get('/api/supplies');
    return response.data;
  },
  
  create: async (supplyData: any) => {
    const response = await api.post('/api/supplies', supplyData);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/api/supplies/stats');
    return response.data;
  }
};

export default api; 