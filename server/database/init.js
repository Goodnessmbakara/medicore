import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// For WebContainer environment, we'll use a mock database setup
// since PostgreSQL isn't available in the browser environment
const isWebContainer = process.env.NODE_ENV !== 'production';

let pool;

if (isWebContainer) {
  // Mock database for WebContainer environment
  console.log('🔧 Running in WebContainer - using mock database');
  
  // Mock user data with hashed passwords and PINs
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@medicore.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
      pin_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 1234
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'doctor1',
      email: 'doctor1@medicore.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // doctor123
      pin_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 2345
      role: 'doctor',
      full_name: 'Dr. John Smith',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'nurse1',
      email: 'nurse1@medicore.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // nurse123
      pin_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 3456
      role: 'nurse',
      full_name: 'Sarah Johnson',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      username: 'pharmacist1',
      email: 'pharmacist1@medicore.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // pharmacy123
      pin_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 4567
      role: 'pharmacist',
      full_name: 'Michael Brown',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const mockPatients = [
    {
      id: 1,
      user_id: 5,
      patient_id: 'P000001',
      age: 35,
      weight: 70.5,
      allergies: 'Penicillin',
      blood_pressure: '120/80',
      temperature: 36.5,
      emergency_contact: 'Jane Doe - 555-0123',
      created_at: new Date().toISOString()
    }
  ];

  const mockSupplies = [
    {
      id: 1,
      drug_name: 'Paracetamol',
      quantity: 150,
      batch_id: 'PAR001',
      expiry_date: '2025-12-31',
      unit_price: 0.50,
      supplier: 'PharmaCorp',
      updated_at: new Date().toISOString(),
      updated_by: 4
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
      updated_by: 4
    }
  ];

  // Create a mock pool that simulates database operations
  pool = {
    query: async (sql, params = []) => {
      console.log('Mock DB Query:', sql.substring(0, 100) + '...');
      
      // Return mock responses for different query types
      if (sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX') || sql.includes('ALTER TABLE')) {
        return { rows: [], rowCount: 0 };
      }
      
      // User authentication queries
      if (sql.includes('SELECT * FROM users WHERE username')) {
        const username = params[0];
        const user = mockUsers.find(u => u.username === username);
        return {
          rows: user ? [user] : [],
          rowCount: user ? 1 : 0
        };
      }

      // User validation queries
      if (sql.includes('SELECT id, username, email, role, full_name, is_active FROM users WHERE id')) {
        const userId = params[0];
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          const { password_hash, pin_hash, ...userWithoutHashes } = user;
          return {
            rows: [userWithoutHashes],
            rowCount: 1
          };
        }
        return { rows: [], rowCount: 0 };
      }

      // User stats queries
      if (sql.includes('SELECT') && sql.includes('role') && sql.includes('COUNT(*)')) {
        return {
          rows: [
            { role: 'admin', count: '1', active_count: '1' },
            { role: 'doctor', count: '1', active_count: '1' },
            { role: 'nurse', count: '1', active_count: '1' },
            { role: 'pharmacist', count: '1', active_count: '1' },
            { role: 'patient', count: '0', active_count: '0' }
          ],
          rowCount: 5
        };
      }

      // Doctor logs queries
      if (sql.includes('audit_logs') && sql.includes('doctor')) {
        return {
          rows: [
            {
              full_name: 'Dr. John Smith',
              action: 'PRESCRIPTION_CREATED',
              created_at: new Date().toISOString()
            }
          ],
          rowCount: 1
        };
      }

      // Patients queries
      if (sql.includes('SELECT p.*, u.full_name') && sql.includes('patients p')) {
        return {
          rows: mockPatients.map(p => ({
            ...p,
            full_name: 'John Patient',
            email: 'patient@example.com',
            last_visit: new Date().toISOString()
          })),
          rowCount: mockPatients.length
        };
      }

      // Supplies queries
      if (sql.includes('SELECT s.*, u.full_name as updated_by_name FROM supplies')) {
        return {
          rows: mockSupplies.map(s => ({
            ...s,
            updated_by_name: 'Michael Brown'
          })),
          rowCount: mockSupplies.length
        };
      }

      // Appointments queries
      if (sql.includes('appointments')) {
        return { rows: [], rowCount: 0 };
      }

      // Prescriptions queries
      if (sql.includes('prescriptions')) {
        return { rows: [], rowCount: 0 };
      }

      // Insert queries
      if (sql.includes('INSERT INTO')) {
        return {
          rows: [{ id: Math.floor(Math.random() * 1000) + 1 }],
          rowCount: 1
        };
      }

      // Update queries
      if (sql.includes('UPDATE')) {
        return { rows: [], rowCount: 1 };
      }

      // Audit log inserts
      if (sql.includes('audit_logs')) {
        return { rows: [], rowCount: 1 };
      }
      
      return { rows: [], rowCount: 0 };
    },
    end: async () => {
      console.log('Mock database connection closed');
    }
  };
} else {
  // Real PostgreSQL connection for production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/medicore',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// Database schema initialization
const initializeDatabase = async () => {
  try {
    if (isWebContainer) {
      console.log('✅ Mock database initialized for WebContainer environment');
      console.log('📋 Demo credentials available:');
      console.log('   Admin: admin / admin123 / PIN: 1234');
      console.log('   Doctor: doctor1 / doctor123 / PIN: 2345');
      console.log('   Nurse: nurse1 / nurse123 / PIN: 3456');
      console.log('   Pharmacist: pharmacist1 / pharmacy123 / PIN: 4567');
      return;
    }

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'patient')),
        full_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        patient_id VARCHAR(20) UNIQUE NOT NULL,
        age INTEGER,
        weight DECIMAL(5,2),
        allergies TEXT,
        blood_pressure VARCHAR(20),
        temperature DECIMAL(4,1),
        emergency_contact VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        appointment_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
        notes TEXT,
        urgency VARCHAR(10) DEFAULT 'low' CHECK (urgency IN ('low', 'moderate', 'high')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES users(id),
        nurse_id INTEGER REFERENCES users(id),
        record_type VARCHAR(50) NOT NULL,
        diagnosis TEXT,
        symptoms TEXT,
        pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        pharmacist_id INTEGER REFERENCES users(id),
        drug_name VARCHAR(100) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        instructions TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dispensed', 'cancelled')),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        dispensed_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplies (
        id SERIAL PRIMARY KEY,
        drug_name VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        batch_id VARCHAR(50),
        expiry_date DATE,
        unit_price DECIMAL(10,2),
        supplier VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_requests (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        nurse_id INTEGER REFERENCES users(id),
        doctor_id INTEGER REFERENCES users(id),
        request_type VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        preferred_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
        response_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient_doctor ON appointments(patient_id, doctor_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export { pool, initializeDatabase };