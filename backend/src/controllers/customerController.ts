import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile are required' });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, mobile, email, business_name, gst_number, customer_type, address, status || 'Lead', follow_up_date || null, notes]
    );

    res.status(201).json({ message: 'Customer created successfully', customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM customers';
    let params: any[] = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR mobile ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${offset}`;

    const result = await pool.query(query, params);
    res.json({ customers: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes } = req.body;

    const result = await pool.query(
      `UPDATE customers SET name=$1, mobile=$2, email=$3, business_name=$4, gst_number=$5,
       customer_type=$6, address=$7, status=$8, follow_up_date=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};