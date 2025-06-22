import express from 'express';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { authenticateToken, requireRole, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const patientSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  age: Joi.number().integer().min(0).max(120).required(),
  pin: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
  emergencyContact: Joi.string().max(100),
  allergies: Joi.string().allow(''),
  weight: Joi.number().min(0).max(1000),
  temperature: Joi.number().min(35).max(45),
  bloodPressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/)
});

const diagnosticsSchema = Joi.object({
  weight: Joi.number().min(0).max(1000),
  temperature: Joi.number().min(35).max(45),
  bloodPressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/),
  symptoms: Joi.string().max(1000),
  painScale: Joi.number().integer().min(0).max(10),
  notes: Joi.string().max(2000)
});

// Get all patients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.full_name, u.email,
             mr.created_at as last_visit
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT patient_id, MAX(created_at) as created_at
        FROM medical_records
        GROUP BY patient_id
      ) mr ON p.id = mr.patient_id
    `;

    const params = [];
    if (search) {
      query += ` WHERE (p.patient_id ILIKE $1 OR u.full_name ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM patients p JOIN users u ON p.user_id = u.id`;
    const countParams = [];
    if (search) {
      countQuery += ` WHERE (p.patient_id ILIKE $1 OR u.full_name ILIKE $1)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      patients: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new patient (nurse only)
router.post('/register', authenticateToken, requireRole(['nurse', 'admin']), async (req, res) => {
  try {
    const { error, value } = patientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, age, pin, emergencyContact, allergies, weight, temperature, bloodPressure } = value;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE full_name = $1',
      [fullName]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Patient with this name already exists' });
    }

    // Generate unique username and patient ID
    const username = `patient_${Date.now()}`;
    const patientIdResult = await pool.query('SELECT COUNT(*) FROM patients');
    const patientCount = parseInt(patientIdResult.rows[0].count) + 1;
    const patientId = `P${String(patientCount).padStart(6, '0')}`;

    // Create user account
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('temp123', 10); // Temporary password
    const pinHash = await bcrypt.hash(pin, 10);

    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
      VALUES ($1, $2, $3, $4, 'patient', $5)
      RETURNING id
    `, [username, `${username}@temp.com`, passwordHash, pinHash, fullName]);

    const userId = userResult.rows[0].id;

    // Create patient record
    const patientResult = await pool.query(`
      INSERT INTO patients (user_id, patient_id, age, weight, allergies, blood_pressure, temperature, emergency_contact)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [userId, patientId, age, weight, allergies, bloodPressure, temperature, emergencyContact]);

    // Create initial medical record
    await pool.query(`
      INSERT INTO medical_records (patient_id, nurse_id, record_type, notes)
      VALUES ($1, $2, 'registration', 'Patient registered by nurse')
    `, [patientResult.rows[0].id, req.user.id]);

    await logActivity(
      req.user.id,
      'PATIENT_REGISTERED',
      'patient',
      patientResult.rows[0].id,
      { patientId, fullName },
      req
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      patient: {
        ...patientResult.rows[0],
        full_name: fullName,
        username,
        temporaryPassword: 'temp123'
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, u.full_name, u.email, u.username
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get medical records
    const recordsResult = await pool.query(`
      SELECT mr.*, u.full_name as created_by_name, u.role as created_by_role
      FROM medical_records mr
      LEFT JOIN users u ON (mr.doctor_id = u.id OR mr.nurse_id = u.id)
      WHERE mr.patient_id = $1
      ORDER BY mr.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      patient: result.rows[0],
      medicalRecords: recordsResult.rows
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient profile (nurse only)
router.put('/:id', authenticateToken, requireRole(['nurse', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, allergies, bloodPressure, temperature, emergencyContact } = req.body;

    const result = await pool.query(`
      UPDATE patients 
      SET weight = $1, allergies = $2, blood_pressure = $3, temperature = $4, 
          emergency_contact = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [weight, allergies, bloodPressure, temperature, emergencyContact, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await logActivity(
      req.user.id,
      'PATIENT_UPDATED',
      'patient',
      id,
      { updatedFields: Object.keys(req.body) },
      req
    );

    res.json({
      message: 'Patient updated successfully',
      patient: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add diagnostics/medical record
router.post('/:id/diagnostics', authenticateToken, requireRole(['nurse', 'doctor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = diagnosticsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { weight, temperature, bloodPressure, symptoms, painScale, notes } = value;

    // Update patient vitals if provided
    if (weight || temperature || bloodPressure) {
      await pool.query(`
        UPDATE patients 
        SET weight = COALESCE($1, weight),
            temperature = COALESCE($2, temperature),
            blood_pressure = COALESCE($3, blood_pressure),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [weight, temperature, bloodPressure, id]);
    }

    // Create medical record
    const recordResult = await pool.query(`
      INSERT INTO medical_records (patient_id, ${req.user.role}_id, record_type, symptoms, pain_scale, notes)
      VALUES ($1, $2, 'diagnostics', $3, $4, $5)
      RETURNING *
    `, [id, req.user.id, symptoms, painScale, notes]);

    await logActivity(
      req.user.id,
      'DIAGNOSTICS_ADDED',
      'medical_record',
      recordResult.rows[0].id,
      { patientId: id },
      req
    );

    res.status(201).json({
      message: 'Diagnostics added successfully',
      record: recordResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding diagnostics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;