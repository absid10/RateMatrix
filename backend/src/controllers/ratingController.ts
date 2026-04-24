import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// POST /api/ratings  (normal user - submit or update)
export async function submitRating(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { store_id, rating } = req.body;

    // check store exists
    const [storeCheck] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM stores WHERE id = ?',
      [store_id]
    );
    if (storeCheck.length === 0) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    // check if rating already exists (upsert)
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, store_id]
    );

    if (existing.length > 0) {
      // update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, store_id]
      );
      res.json({ message: 'Rating updated successfully.' });
    } else {
      // insert new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, store_id, rating]
      );
      res.status(201).json({ message: 'Rating submitted successfully.' });
    }
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// GET /api/ratings/store/:storeId  (owner - users who rated their store)
export async function getStoreRatings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { storeId } = req.params;
    const userId = req.user!.userId;

    // verify this owner actually owns the store
    const [storeCheck] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );
    if (storeCheck.length === 0) {
      res.status(403).json({ message: 'You do not own this store.' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Get store ratings error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
