export interface User {
  id: number;
  name: string;
  email: string;
  address: string | null;
  role: 'admin' | 'user' | 'owner';
  created_at?: string;
  // only present for store owners when viewing detail
  stores?: StoreWithRating[];
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string | null;
  owner_id: number | null;
  owner_name?: string | null;
  overall_rating: number;
  total_ratings: number;
  // only present for normal users
  user_rating?: number | null;
}

export interface StoreWithRating {
  id: number;
  name: string;
  avg_rating: number;
}

export interface Rater {
  name: string;
  email: string;
  rating: number;
  store_id?: number;
  store_name?: string;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerDashboardData {
  stores: { id: number; name: string }[];
  averageRating: number;
  raters: Rater[];
}

export interface AuthState {
  token: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'owner';
  } | null;
}

export interface ApiError {
  message?: string;
  errors?: { msg: string; path: string }[];
}
