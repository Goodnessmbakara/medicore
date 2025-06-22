import express from 'express';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { authenticateToken, requireRole, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Validation schema
const appointmentSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  doctorId: Joi.number().integer().required(),
  appointmentDate: Joi.date().iso().required(),
  notes: Joi.string().max(500),
  urgency: Joi.string().valid('low', 'moderate', 'high').default('low')
});

// Get appointments (role-based)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date, urgency } = req.query;
    let query = `
      SELECT a.*, p.patient_id, u1.full_name as patient_name,
             u2.full_name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN users u2 ON a.doctor_id = u2.id
    `;

    const conditions = [];
    const params = [];

    // Role-based filtering
    if (req.user.role === 'doctor') {
      conditions.push(`a.doctor_id = $${params.length + 1}`);
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      // Get patient record for this user
      const patientResult = await pool.query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      if (patientResult.rows.length > 0) {
        conditions.push(`a.patient_id = $${params.length + 1}`);
        params.push(patientResult.rows[0].id);
      }
    }

    // Additional filters
    if (status) {
      conditions.push(`a.status = $${params.length + 1}`);
      params.push(status);
    }

    if (date) {
      conditions.push(`DATE(a.appointment_date) = $${params.length + 1}`);
      params.push(date);
    }

    if (urgency) {
      conditions.push(`a.urgency = $${params.length + 1}`);
      params.push(urgency);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.appointment_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create appointment
router.post('/', authenticateToken, requireRole(['doctor', 'nurse', 'admin']), async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { patientId, doctorId, appointmentDate, notes, urgency } = value;

    // Check for conflicts
    const conflictResult = await pool.query(`
      SELECT id FROM appointments 
      WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'
    `, [doctorId, appointmentDate]);

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'Doctor already has an appointment at this time' });
    }

    const result = await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes, urgency)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [patientId, doctorId, appointmentDate, notes, urgency]);

    await logActivity(
      req.user.id,
      'APPOINTMENT_CREATED',
      'appointment',
      result.rows[0].id,
      { patientId, doctorId, urgency },
      req
    );

    // Notify doctor via WebSocket
    const io = req.app.get('io');
    io.to(`user_${doctorId}`).emit('notification', {
      type: 'appointment_created',
      message: 'New appointment scheduled',
      data: result.rows[0]
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(`
      UPDATE appointments 
      SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await logActivity(
      req.user.id,
      'APPOINTMENT_STATUS_UPDATED',
      'appointment',
      id,
      { status, notes },
      req
    );

    res.json({
      message: 'Appointment status updated',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor queue (pending appointments)
router.get('/queue', authenticateToken, requireRole(['doctor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.patient_id, u.full_name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = $1 AND a.status = 'scheduled'
        AND a.appointment_date >= CURRENT_DATE
      ORDER BY a.urgency DESC, a.appointment_date ASC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctor queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;