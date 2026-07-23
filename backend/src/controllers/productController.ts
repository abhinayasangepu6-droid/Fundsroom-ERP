import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, category, unit_price, current_stock, min_stock_alert, location } = req.body;

    if (!name || !sku || !unit_price) {
      return res.status(400).json({ error: 'Name, SKU, and unit price are required' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, sku, category, unit_price, current_stock, min_stock_alert, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, sku, category, unit_price, current_stock || 0, min_stock_alert || 0, location]
    );

    res.status(201).json({ message: 'Product created successfully', product: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM products';
    let params: any[] = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR sku ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${offset}`;

    const result = await pool.query(query, params);
    res.json({ products: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, category, unit_price, current_stock, min_stock_alert, location } = req.body;

    const result = await pool.query(
      `UPDATE products SET name=$1, sku=$2, category=$3, unit_price=$4, current_stock=$5, min_stock_alert=$6, location=$7
       WHERE id=$8 RETURNING *`,
      [name, sku, category, unit_price, current_stock, min_stock_alert, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};