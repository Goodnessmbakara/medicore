import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use real database if DATABASE_URL is provided, otherwise use mock data
const useRealDatabase = !!process.env.DATABASE_URL;

// Mock database for development/testing
const mockDatabase = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@medicore.com',
      password_hash: '$2a$10$mock.hash.admin',
      pin_hash: '$2a$10$mock.pin.1234',
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'doctor1',
      email: 'doctor1@medicore.com',
      password_hash: '$2a$10$mock.hash.doctor',
      pin_hash: '$2a$10$mock.pin.2345',
      role: 'doctor',
      full_name: 'Dr. John Smith',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      username: 'nurse1',
      email: 'nurse1@medicore.com',
      password_hash: '$2a$10$mock.hash.nurse',
      pin_hash: '$2a$10$mock.pin.3456',
      role: 'nurse',
      full_name: 'Sarah Johnson',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      username: 'pharmacist1',
      email: 'pharmacist1@medicore.com',
      password_hash: '$2a$10$mock.hash.pharmacist',
      pin_hash: '$2a$10$mock.pin.4567',
      role: 'pharmacist',
      full_name: 'Michael Brown',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      username: 'patient1',
      email: 'patient1@medicore.com',
      password_hash: '$2a$10$mock.hash.patient',
      pin_hash: '$2a$10$mock.pin.5678',
      role: 'patient',
      full_name: 'John Patient',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  patients: [
    {
      id: 1,
      user_id: 5,
      patient_id: 'P001',
      date_of_birth: '1990-05-15',
      gender: 'Male',
      blood_type: 'O+',
      emergency_contact: 'Jane Patient',
      emergency_phone: '+1234567890',
      address: '123 Health St, Medical City, MC 12345',
      insurance_provider: 'HealthCare Plus',
      insurance_number: 'HC123456789',
      allergies: 'Penicillin',
      medical_history: 'Hypertension, controlled with medication',
      created_at: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 2,
      appointment_date: new Date(Date.now() + 86400000).toISOString(),
      appointment_time: '10:00:00',
      status: 'scheduled',
      reason: 'Annual checkup',
      notes: 'Patient requested morning appointment',
      created_at: new Date().toISOString()
    }
  ],
  prescriptions: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 2,
      medication_name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Every 6 hours as needed',
      duration: '7 days',
      status: 'pending',
      notes: 'For pain relief',
      action: 'PRESCRIPTION_CREATED',
      created_at: new Date().toISOString()
    }
  ],
  supplies: [
    {
      id: 1,
      medication_name: 'Ibuprofen',
      quantity: 500,
      unit: 'tablets',
      expiry_date: '2025-12-31',
      supplier: 'PharmaCorp',
      cost_per_unit: 0.25,
      reorder_level: 100,
      created_at: new Date().toISOString()
    }
  ],
  medical_records: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 2,
      record_type: 'consultation',
      symptoms: 'Headache, fever',
      pain_scale: 5,
      notes: 'Patient reports mild headache and low-grade fever',
      created_at: new Date().toISOString()
    }
  ],
  audit_logs: [
    {
      id: 1,
      user_id: 2,
      action: 'PRESCRIPTION_CREATED',
      entity_type: 'prescription',
      entity_id: 1,
      details: JSON.stringify({ medication: 'Ibuprofen', patient_id: 1 }),
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 (Demo)',
      created_at: new Date().toISOString()
    }
  ]
};

// Mock query function for development
const mockQuery = async (sql, params = []) => {
  console.log('Mock query:', sql, params);
  
  // Simple mock query handling
  if (sql.includes('SELECT id, username, email, role, full_name, is_active FROM users WHERE id')) {
    const userId = params[0];
    const user = mockDatabase.users.find(u => u.id === userId);
    return { rows: user ? [user] : [] };
  }
  
  if (sql.includes('SELECT * FROM users')) {
    return { rows: mockDatabase.users };
  }
  
  if (sql.includes('SELECT * FROM patients')) {
    return { rows: mockDatabase.patients };
  }
  
  if (sql.includes('SELECT * FROM appointments')) {
    return { rows: mockDatabase.appointments };
  }
  
  if (sql.includes('SELECT * FROM prescriptions')) {
    return { rows: mockDatabase.prescriptions };
  }
  
  if (sql.includes('SELECT * FROM supplies')) {
    return { rows: mockDatabase.supplies };
  }
  
  if (sql.includes('SELECT * FROM medical_records')) {
    return { rows: mockDatabase.medical_records };
  }
  
  if (sql.includes('SELECT * FROM audit_logs')) {
    return { rows: mockDatabase.audit_logs };
  }
  
  // Default empty result
  return { rows: [] };
};

// Real PostgreSQL pool for production
const pool = useRealDatabase ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
}) : null;

// Initialize database tables
const initializeDatabase = async () => {
  if (!useRealDatabase) {
    console.log('🔧 Running in development - using mock database');
    return;
  }

  try {
    console.log('🗄️ Initializing PostgreSQL database...');
    console.log('📊 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'patient')),
        full_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create patients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        patient_id VARCHAR(20) UNIQUE NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(10),
        blood_type VARCHAR(5),
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        address TEXT,
        insurance_provider VARCHAR(100),
        insurance_number VARCHAR(50),
        allergies TEXT,
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES users(id),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
        reason TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create prescriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES users(id),
        medication_name VARCHAR(100) NOT NULL,
        dosage VARCHAR(50) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dispensed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create supplies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS supplies (
        id SERIAL PRIMARY KEY,
        medication_name VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(20) NOT NULL,
        expiry_date DATE NOT NULL,
        supplier VARCHAR(100),
        cost_per_unit DECIMAL(10,2),
        reorder_level INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create medical_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES users(id),
        nurse_id INTEGER REFERENCES users(id),
        record_type VARCHAR(50) NOT NULL,
        symptoms TEXT,
        pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit_logs table
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
      )
    `);

    // Insert demo data if tables are empty
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('📝 Inserting demo data...');
      
      // Insert demo users
      const bcrypt = await import('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const adminPin = await bcrypt.hash('1234', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin', 'admin@medicore.com', adminPassword, adminPin, 'admin', 'System Administrator']);
      
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      const doctorPin = await bcrypt.hash('2345', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['doctor1', 'doctor1@medicore.com', doctorPassword, doctorPin, 'doctor', 'Dr. John Smith']);
      
      const nursePassword = await bcrypt.hash('nurse123', 10);
      const nursePin = await bcrypt.hash('3456', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['nurse1', 'nurse1@medicore.com', nursePassword, nursePin, 'nurse', 'Sarah Johnson']);
      
      const pharmacistPassword = await bcrypt.hash('pharmacy123', 10);
      const pharmacistPin = await bcrypt.hash('4567', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['pharmacist1', 'pharmacist1@medicore.com', pharmacistPassword, pharmacistPin, 'pharmacist', 'Michael Brown']);
      
      const patientPassword = await bcrypt.hash('patient123', 10);
      const patientPin = await bcrypt.hash('5678', 10);
      
      await pool.query(`
        INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['patient1', 'patient1@medicore.com', patientPassword, patientPin, 'patient', 'John Patient']);
      
      console.log('✅ Demo data inserted successfully');
    }

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Export the appropriate query function
export const query = useRealDatabase ? pool.query.bind(pool) : mockQuery;
export { pool, initializeDatabase };