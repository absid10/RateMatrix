import { Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET /api/users  (admin only)
export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, address, role } = req.query;

    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    } else {
      query += " AND role IN ('admin','user')";
    }

    // sorting
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string) === 'desc' ? 'DESC' : 'ASC';
    const allowedSortCols = ['name', 'email', 'address', 'role', 'created_at'];
    if (allowedSortCols.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${order}`;
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// GET /api/users/:id  (admin only)
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const user = rows[0];

    // if the user is a store owner, also fetch their store rating
    if (user.role === 'owner') {
      const [storeRows] = await pool.query<RowDataPacket[]>(
        `SELECT s.id, s.name, COALESCE(AVG(r.rating), 0) as avg_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [id]
      );
      user.stores = storeRows;
    }

    res.json(user);
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// POST /api/users  (admin only - create any role)
export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password, address, role } = req.body;

    // check if email already taken
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      res.status(409).json({ message: 'A user with this email already exists.' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address || null, role]
    );

    res.status(201).json({
      message: 'User created successfully.',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
