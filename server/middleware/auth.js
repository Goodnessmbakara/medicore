import jwt from 'jsonwebtoken';
import { pool } from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, role, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'Invalid token or user inactive' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, role, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return next(new Error('Authentication error'));
    }

    socket.user = result.rows[0];
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const logActivity = async (userId, action, entityType = null, entityId = null, details = null, req = null) => {
  try {
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      req?.ip || req?.connection?.remoteAddress,
      req?.get('User-Agent')
    ]);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};