# RateMatrix

RateMatrix is a full-stack store rating platform built for a role-based coding challenge.

Users can rate stores from 1 to 5, and each role sees different functionality after a single login flow.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Express.js + TypeScript |
| Database | MySQL 8 |
| Auth | JWT + bcrypt |

## Core Features

- Single authentication system for all roles.
- Three roles with protected pages: `admin`, `user`, `owner`.
- Store rating flow with update support (one rating per user per store).
- Role-aware dashboards.
- Search/filter/sort capabilities in listing screens.
- Client-side and server-side validation.

## Role Capabilities

### System Administrator

- Add stores.
- Link store owners to existing stores.
- Add users (`admin`, `user`, `owner`).
- View dashboard counters: total users, stores, ratings.
- View users list with filters (name, email, address, role) and sorting.
- View stores list with filters (name, email, address) and sorting.
- View user details, including owner store rating details.
- Change password and logout.

### Normal User

- Sign up (self-registration).
- Login and logout.
- Change password.
- Browse all stores.
- Search stores by name and address.
- View overall rating and own submitted rating.
- Submit and modify rating (1-5).

### Store Owner

- Login and logout.
- Change password.
- View owner dashboard with average rating.
- View list of users who rated their assigned store(s).

## Validation Rules

- Name: minimum 20, maximum 60 characters.
- Address: required, maximum 400 characters.
- Password: 8-16 characters, at least one uppercase and one special character.
- Email: standard email format.

## Project Structure

```text
RateMatrix/
	backend/
		src/
			config/
			controllers/
			middleware/
			routes/
			seed.ts
			server.ts
			types.ts
		package.json
	frontend/
		src/
			api/
			components/
			context/
			pages/
			App.tsx
			main.tsx
			index.css
		package.json
	database.sql
	README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- MySQL 8 running on `127.0.0.1:3306`
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create or update `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ratematrix
JWT_SECRET=replace_with_strong_secret
```

Initialize schema and seed admin user:

```bash
npm run seed
```

Run backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Default Admin Login

- Email: `admin@ratematrix.com`
- Password: `Admin@123`

## API Overview

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `PUT /api/auth/password`

### Users (admin)

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`

### Stores

- `GET /api/stores` (all authenticated users)
- `GET /api/stores/:id` (admin)
- `POST /api/stores` (admin)
- `PATCH /api/stores/:id/owner` (admin)

### Ratings

- `POST /api/ratings` (normal user)
- `GET /api/ratings/store/:storeId` (owner)

### Dashboard

- `GET /api/dashboard/admin`
- `GET /api/dashboard/owner`

## Notes

- Public signup is intentionally for normal users only.
- Store owner and admin accounts are created by admin users.
- Admin UI includes direct navigation links for stores and add-store actions.

## Challenge Checklist Mapping

- Express backend: completed.
- MySQL schema with constraints/indexes: completed.
- React frontend with role-based screens: completed.
- Sorting/filtering and rating workflows: completed.
- Form validation rules: completed in frontend and backend.

