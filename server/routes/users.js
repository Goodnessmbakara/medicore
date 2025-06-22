import express from 'express';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { authenticateToken, requireRole, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.full_name, u.created_at, u.is_active,
             COUNT(al.id) as activity_count
      FROM users u
      LEFT JOIN audit_logs al ON u.id = al.user_id
      GROUP BY u.id, u.username, u.email, u.role, u.full_name, u.created_at, u.is_active
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_active THEN 1 END) as active_count
      FROM users 
      GROUP BY role
    `);

    const doctorLogs = await pool.query(`
      SELECT u.full_name, al.action, al.created_at
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE u.role = 'doctor'
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    res.json({
      userStats: stats.rows,
      recentDoctorLogs: doctorLogs.rows
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctors for assignment
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, email
      FROM users 
      WHERE role = 'doctor' AND is_active = true
      ORDER BY full_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status (admin only)
router.patch('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, full_name, is_active
    `, [isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logActivity(
      req.user.id, 
      'USER_STATUS_UPDATED', 
      'user', 
      id, 
      { isActive }, 
      req
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;