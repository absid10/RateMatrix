# RateMatrix — Store Rating Platform

A full-stack web application for submitting and managing store ratings. Built with Express.js (TypeScript), MySQL, and React (TypeScript).

## Features

- **Role-based access control** — Admin, Normal User, Store Owner
- **Admin dashboard** — User/store/rating statistics, CRUD operations
- **Store rating system** — 1-5 star ratings with real-time updates
- **Search & filter** — Filter users and stores by name, email, address
- **Sortable tables** — Click column headers to sort ascending/descending
- **Password management** — Secure password update functionality
- **Form validation** — Client-side and server-side validation
- **JWT authentication** — Secure token-based auth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js + TypeScript |
| Database | MySQL 8 |
| Auth | JWT + bcrypt |
| Frontend | React 18 + TypeScript (Vite) |
| HTTP | Axios |

## Prerequisites

- Node.js 18+
- MySQL 8+ running on localhost:3306
- npm

## Getting Started

### 1. Setup the Database

```bash
cd backend
npm install
npm run seed
```

This creates the `ratematrix` database, tables, and a default admin user:
- **Email:** admin@ratematrix.com
- **Password:** Admin@123

### 2. Start the Backend

```bash
cd backend
npm run dev
```

Server runs on http://localhost:5000

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

## User Roles

### System Administrator
- Dashboard with user/store/rating counts
- Add stores, normal users, and admin users
- View and filter user/store listings
- View user details (with store rating for owners)

### Normal User
- Sign up and log in
- Browse stores, search by name and address
- Submit and modify ratings (1-5 stars)
- Update password

### Store Owner
- View dashboard with average store rating
- See list of users who rated their store
- Update password

## Form Validation Rules

| Field | Rule |
|-------|------|
| Name | 20-60 characters |
| Email | Valid email format |
| Password | 8-16 chars, 1 uppercase, 1 special character |
| Address | Max 400 characters |

## Project Structure

```
RateMatrix/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express entry point
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── config/db.ts       # MySQL connection pool
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Request handlers
│   │   └── seed.ts            # DB setup & seeding
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Router & layout
│   │   ├── types.ts           # Frontend types
│   │   ├── api/axios.ts       # HTTP client
│   │   ├── context/           # Auth state
│   │   ├── components/        # Reusable UI
│   │   └── pages/             # Role-based pages
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register (normal user)
- `POST /api/auth/login` — Login
- `PUT /api/auth/password` — Update password

### Users (Admin)
- `GET /api/users` — List users (filterable)
- `GET /api/users/:id` — User details
- `POST /api/users` — Create user

### Stores
- `GET /api/stores` — List stores
- `GET /api/stores/:id` — Store details
- `POST /api/stores` — Create store (Admin)

### Ratings
- `POST /api/ratings` — Submit/update rating
- `GET /api/ratings/store/:storeId` — Store's raters (Owner)

### Dashboard
- `GET /api/dashboard/admin` — Admin stats
- `GET /api/dashboard/owner` — Owner stats
