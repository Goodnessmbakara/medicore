import express from 'express';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { authenticateToken, requireRole, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Validation schema
const prescriptionSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  drugName: Joi.string().min(2).max(100).required(),
  dosage: Joi.string().min(1).max(100).required(),
  instructions: Joi.string().max(500),
  quantity: Joi.number().integer().min(1).required()
});

// Get prescriptions (role-based)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT pr.*, p.patient_id, u1.full_name as patient_name,
             u2.full_name as doctor_name, u3.full_name as pharmacist_name
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON pr.doctor_id = u2.id
      LEFT JOIN users u3 ON pr.pharmacist_id = u3.id
    `;

    const conditions = [];
    const params = [];

    // Role-based filtering
    if (req.user.role === 'doctor') {
      conditions.push(`pr.doctor_id = $${params.length + 1}`);
      params.push(req.user.id);
    } else if (req.user.role === 'pharmacist') {
      conditions.push(`pr.status IN ('pending', 'verified')`);
    } else if (req.user.role === 'patient') {
      const patientResult = await pool.query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      if (patientResult.rows.length > 0) {
        conditions.push(`pr.patient_id = $${params.length + 1}`);
        params.push(patientResult.rows[0].id);
      }
    }

    if (status) {
      conditions.push(`pr.status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY pr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create prescription (doctors only)
router.post('/', authenticateToken, requireRole(['doctor']), async (req, res) => {
  try {
    const { error, value } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { patientId, drugName, dosage, instructions, quantity } = value;

    const result = await pool.query(`
      INSERT INTO prescriptions (patient_id, doctor_id, drug_name, dosage, instructions, quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [patientId, req.user.id, drugName, dosage, instructions, quantity]);

    await logActivity(
      req.user.id,
      'PRESCRIPTION_CREATED',
      'prescription',
      result.rows[0].id,
      { patientId, drugName, quantity },
      req
    );

    // Notify pharmacists
    const io = req.app.get('io');
    io.to('pharmacist').emit('notification', {
      type: 'new_prescription',
      message: 'New prescription requires verification',
      data: result.rows[0]
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify prescription (pharmacists only)
router.patch('/:id/verify', authenticateToken, requireRole(['pharmacist']), async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'Valid 4-digit PIN required' });
    }

    // Verify PIN
    const bcrypt = await import('bcryptjs');
    const userResult = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [req.user.id]);
    const pinValid = await bcrypt.compare(pin, userResult.rows[0].pin_hash);

    if (!pinValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const result = await pool.query(`
      UPDATE prescriptions 
      SET status = 'verified', pharmacist_id = $1, verified_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'pending'
      RETURNING *
    `, [req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found or already processed' });
    }

    await logActivity(
      req.user.id,
      'PRESCRIPTION_VERIFIED',
      'prescription',
      id,
      null,
      req
    );

    res.json({
      message: 'Prescription verified successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error('Error verifying prescription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dispense prescription (pharmacists only)
router.patch('/:id/dispense', authenticateToken, requireRole(['pharmacist']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE prescriptions 
      SET status = 'dispensed', dispensed_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'verified' AND pharmacist_id = $2
      RETURNING *
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found or not ready for dispensing' });
    }

    // Update supplies
    await pool.query(`
      UPDATE supplies 
      SET quantity = quantity - $1
      WHERE drug_name = $2 AND quantity >= $1
    `, [result.rows[0].quantity, result.rows[0].drug_name]);

    await logActivity(
      req.user.id,
      'PRESCRIPTION_DISPENSED',
      'prescription',
      id,
      { drugName: result.rows[0].drug_name, quantity: result.rows[0].quantity },
      req
    );

    res.json({
      message: 'Prescription dispensed successfully',
      prescription: result.rows[0]
    });
  } catch (error) {
    console.error('Error dispensing prescription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;