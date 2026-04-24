import { Request } from 'express';

// -- Database row types --

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string | null;
  role: 'admin' | 'user' | 'owner';
  created_at: Date;
  updated_at: Date;
}

export interface StoreRow {
  id: number;
  name: string;
  email: string;
  address: string | null;
  owner_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface RatingRow {
  id: number;
  user_id: number;
  store_id: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

// -- JWT --

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user' | 'owner';
}

// -- Extended request with auth info --

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
