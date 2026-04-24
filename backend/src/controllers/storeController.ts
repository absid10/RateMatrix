import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET /api/stores  (authenticated)
export async function getStores(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, address } = req.query;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let query = `
      SELECT 
        s.id, s.name, s.email, s.address, s.owner_id,
        MAX(o.name) as owner_name,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN users o ON o.id = s.owner_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    // sorting
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string) === 'desc' ? 'DESC' : 'ASC';
    const allowedSortCols = ['name', 'email', 'address', 'overall_rating', 'owner_name'];
    if (allowedSortCols.includes(sortBy)) {
      if (sortBy === 'name' || sortBy === 'email' || sortBy === 'address') {
        query += ` ORDER BY s.${sortBy} ${order}`;
      } else {
        query += ` ORDER BY ${sortBy} ${order}`;
      }
    }

    const [stores] = await pool.query<RowDataPacket[]>(query, params);

    // if the user is a normal user, also fetch their submitted rating for each store
    if (userRole === 'user' && userId) {
      const [userRatings] = await pool.query<RowDataPacket[]>(
        'SELECT store_id, rating FROM ratings WHERE user_id = ?',
        [userId]
      );

      const ratingMap: Record<number, number> = {};
      userRatings.forEach((row: any) => {
        ratingMap[row.store_id] = row.rating;
      });

      stores.forEach((store: any) => {
        store.user_rating = ratingMap[store.id] || null;
      });
    }

    res.json(stores);
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// GET /api/stores/:id  (admin)
export async function getStoreById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, COALESCE(AVG(r.rating), 0) as overall_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get store by id error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// POST /api/stores  (admin only)
export async function createStore(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, address, owner_id } = req.body;

    // if owner_id provided, check that user exists and has role 'owner'
    if (owner_id) {
      const [ownerRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, role FROM users WHERE id = ?',
        [owner_id]
      );
      if (ownerRows.length === 0) {
        res.status(404).json({ message: 'Owner user not found.' });
        return;
      }
      if (ownerRows[0].role !== 'owner') {
        res.status(400).json({ message: 'The specified user is not a store owner.' });
        return;
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address || null, owner_id || null]
    );

    res.status(201).json({
      message: 'Store created successfully.',
      storeId: result.insertId,
    });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// PATCH /api/stores/:id/owner  (admin only)
export async function assignStoreOwner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { owner_id } = req.body as { owner_id: number | null };

    if (owner_id === undefined) {
      res.status(400).json({ message: 'owner_id is required. Use null to unassign owner.' });
      return;
    }

    const [storeRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM stores WHERE id = ?',
      [id]
    );

    if (storeRows.length === 0) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    if (owner_id !== null) {
      const [ownerRows] = await pool.query<RowDataPacket[]>(
        'SELECT id, role FROM users WHERE id = ?',
        [owner_id]
      );

      if (ownerRows.length === 0) {
        res.status(404).json({ message: 'Owner user not found.' });
        return;
      }

      if (ownerRows[0].role !== 'owner') {
        res.status(400).json({ message: 'The specified user is not a store owner.' });
        return;
      }
    }

    await pool.query<ResultSetHeader>(
      'UPDATE stores SET owner_id = ? WHERE id = ?',
      [owner_id, id]
    );

    res.json({
      message: owner_id === null
        ? 'Store owner removed successfully.'
        : 'Store owner assigned successfully.',
    });
  } catch (err) {
    console.error('Assign store owner error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
