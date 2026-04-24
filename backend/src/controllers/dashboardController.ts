import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';
import { RowDataPacket } from 'mysql2';

// GET /api/dashboard/admin
export async function adminDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [userCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );
    const [storeCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM stores'
    );
    const [ratingCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM ratings'
    );

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// GET /api/dashboard/owner
export async function ownerDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // get the owner's store(s)
    const [stores] = await pool.query<RowDataPacket[]>(
      'SELECT id, name FROM stores WHERE owner_id = ?',
      [userId]
    );

    if (stores.length === 0) {
      res.json({ stores: [], averageRating: 0, raters: [] });
      return;
    }

    const storeIds = stores.map((s: any) => s.id);

    // average rating across all their stores
    const [avgResult] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating
       FROM ratings WHERE store_id IN (?)`,
      [storeIds]
    );

    // list of raters
    const [raters] = await pool.query<RowDataPacket[]>(
      `SELECT u.name, u.email, r.rating, r.store_id, s.name as store_name, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       JOIN stores s ON s.id = r.store_id
       WHERE r.store_id IN (?)
       ORDER BY r.created_at DESC`,
      [storeIds]
    );

    res.json({
      stores,
      averageRating: parseFloat(avgResult[0].avg_rating) || 0,
      raters,
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}
