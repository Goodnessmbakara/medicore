import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { logActivity } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// For WebContainer demo environment
const isWebContainer = process.env.NODE_ENV === 'development';

// Demo credentials for WebContainer
const demoCredentials = {
  admin: { password: 'admin123', pin: '1234' },
  doctor1: { password: 'doctor123', pin: '2345' },
  nurse1: { password: 'nurse123', pin: '3456' },
  pharmacist1: { password: 'pharmacy123', pin: '4567' }
};

// Validation schemas
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  pin: Joi.string().length(4).pattern(/^[0-9]+$/).required()
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  pin: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
  role: Joi.string().valid('admin', 'doctor', 'nurse', 'pharmacist', 'patient').required(),
  fullName: Joi.string().min(2).max(100).required()
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password, pin } = value;

    if (isWebContainer) {
      // Demo authentication for WebContainer
      const demoUser = demoCredentials[username];
      if (!demoUser || demoUser.password !== password || demoUser.pin !== pin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get user data from mock database
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      await logActivity(user.id, 'LOGIN_SUCCESS', 'auth', null, null, req);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name
        }
      });
    } else {
      // Production authentication with real database
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      const passwordValid = await bcrypt.compare(password, user.password_hash);
      const pinValid = await bcrypt.compare(pin, user.pin_hash);

      if (!passwordValid || !pinValid) {
        await logActivity(user.id, 'LOGIN_FAILED', 'auth', null, { reason: 'invalid_credentials' }, req);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      await logActivity(user.id, 'LOGIN_SUCCESS', 'auth', null, null, req);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint (for admin to add users)
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, pin, role, fullName } = value;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password and PIN
    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);

    // Insert new user
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, pin_hash, role, full_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, role, full_name, created_at
    `, [username, email, passwordHash, pinHash, role, fullName]);

    const newUser = result.rows[0];

    // If user is a patient, create patient record
    if (role === 'patient') {
      const patientId = `P${String(newUser.id).padStart(6, '0')}`;
      await pool.query(`
        INSERT INTO patients (user_id, patient_id)
        VALUES ($1, $2)
      `, [newUser.id, patientId]);
    }

    await logActivity(newUser.id, 'USER_CREATED', 'user', newUser.id, { role }, req);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.full_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token validation endpoint
router.get('/validate', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, role, full_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;