import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createChallan = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { challan_number, customer_id, products, total_quantity, status, created_by } = req.body;

    if (!challan_number || !customer_id || !products || !Array.isArray(products) || products.length === 0) {
      client.release();
      return res.status(400).json({ error: 'Challan number, customer, and at least one product are required' });
    }

    await client.query('BEGIN');

    // Step 1: Check stock availability for every product BEFORE deducting anything
    for (const item of products) {
      const stockCheck = await client.query(
        'SELECT id, name, current_stock FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (stockCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ error: `Product with id ${item.product_id} not found` });
      }

      const product = stockCheck.rows[0];

      if (product.current_stock < item.quantity) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.current_stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Step 2: All checks passed — deduct stock for each product
    for (const item of products) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Step 3: Create the challan record
    const result = await client.query(
      `INSERT INTO challans (challan_number, customer_id, products, total_quantity, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [challan_number, customer_id, JSON.stringify(products), total_quantity, status || 'Draft', created_by || null]
    );

    await client.query('COMMIT');
    client.release();

    res.status(201).json({ message: 'Challan created successfully, stock updated', challan: result.rows[0] });
  } catch (err: any) {
    await client.query('ROLLBACK');
    client.release();

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Challan number already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getChallans = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT * FROM challans ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), offset]
    );

    res.json({ challans: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getChallanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM challans WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    res.json({ challan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};