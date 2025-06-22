import express from 'express';
import Joi from 'joi';
import { pool } from '../database/init.js';
import { authenticateToken, requireRole, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Validation schema
const supplySchema = Joi.object({
  drugName: Joi.string().min(2).max(100).required(),
  quantity: Joi.number().integer().min(0).required(),
  batchId: Joi.string().max(50),
  expiryDate: Joi.date().iso(),
  unitPrice: Joi.number().min(0),
  supplier: Joi.string().max(100)
});

// Get all supplies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { lowStock = false } = req.query;
    
    let query = `
      SELECT s.*, u.full_name as updated_by_name
      FROM supplies s
      LEFT JOIN users u ON s.updated_by = u.id
    `;

    if (lowStock === 'true') {
      query += ' WHERE s.quantity < 50';
    }

    query += ' ORDER BY s.drug_name ASC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supplies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add or update supply (pharmacists only)
router.post('/', authenticateToken, requireRole(['pharmacist', 'admin']), async (req, res) => {
  try {
    const { error, value } = supplySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { drugName, quantity, batchId, expiryDate, unitPrice, supplier } = value;

    // Check if drug already exists
    const existingSupply = await pool.query(
      'SELECT id, quantity FROM supplies WHERE drug_name = $1',
      [drugName]
    );

    let result;
    if (existingSupply.rows.length > 0) {
      // Update existing supply
      const currentQuantity = existingSupply.rows[0].quantity;
      result = await pool.query(`
        UPDATE supplies 
        SET quantity = quantity + $1, batch_id = COALESCE($2, batch_id),
            expiry_date = COALESCE($3, expiry_date), unit_price = COALESCE($4, unit_price),
            supplier = COALESCE($5, supplier), updated_at = CURRENT_TIMESTAMP,
            updated_by = $6
        WHERE id = $7
        RETURNING *
      `, [quantity, batchId, expiryDate, unitPrice, supplier, req.user.id, existingSupply.rows[0].id]);

      await logActivity(
        req.user.id,
        'SUPPLY_UPDATED',
        'supply',
        result.rows[0].id,
        { drugName, addedQuantity: quantity, newTotal: currentQuantity + quantity },
        req
      );
    } else {
      // Create new supply
      result = await pool.query(`
        INSERT INTO supplies (drug_name, quantity, batch_id, expiry_date, unit_price, supplier, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [drugName, quantity, batchId, expiryDate, unitPrice, supplier, req.user.id]);

      await logActivity(
        req.user.id,
        'SUPPLY_CREATED',
        'supply',
        result.rows[0].id,
        { drugName, quantity },
        req
      );
    }

    // Check for low stock and notify
    if (result.rows[0].quantity < 50) {
      const io = req.app.get('io');
      io.to('pharmacist').emit('notification', {
        type: 'low_stock',
        message: `Low stock alert: ${drugName} (${result.rows[0].quantity} remaining)`,
        data: result.rows[0]
      });
    }

    res.status(201).json({
      message: existingSupply.rows.length > 0 ? 'Supply updated successfully' : 'Supply added successfully',
      supply: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding/updating supply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get supply statistics
router.get('/stats', authenticateToken, requireRole(['pharmacist', 'admin']), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_drugs,
        SUM(quantity) as total_quantity,
        COUNT(CASE WHEN quantity < 50 THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon
      FROM supplies
    `);

    const recentUpdates = await pool.query(`
      SELECT s.drug_name, s.quantity, s.updated_at, u.full_name as updated_by_name
      FROM supplies s
      LEFT JOIN users u ON s.updated_by = u.id
      ORDER BY s.updated_at DESC
      LIMIT 5
    `);

    res.json({
      statistics: stats.rows[0],
      recentUpdates: recentUpdates.rows
    });
  } catch (error) {
    console.error('Error fetching supply stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;