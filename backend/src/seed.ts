import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'ratematrix';

  console.log(`Creating database "${dbName}" if it doesn't exist...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  // create tables
  console.log('Creating tables...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(60)  NOT NULL,
      email       VARCHAR(255) NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      address     VARCHAR(400) NOT NULL,
      role        ENUM('admin','user','owner') NOT NULL DEFAULT 'user',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_users_name_len CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
      CONSTRAINT chk_users_address_len CHECK (CHAR_LENGTH(address) <= 400),
      INDEX idx_users_name (name),
      INDEX idx_users_address (address(191)),
      INDEX idx_users_role (role)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS stores (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(60)  NOT NULL,
      email       VARCHAR(255) NOT NULL UNIQUE,
      address     VARCHAR(400) NOT NULL,
      owner_id    INT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_stores_name_len CHECK (CHAR_LENGTH(name) BETWEEN 20 AND 60),
      CONSTRAINT chk_stores_address_len CHECK (CHAR_LENGTH(address) <= 400),
      INDEX idx_stores_name (name),
      INDEX idx_stores_address (address(191)),
      INDEX idx_stores_owner_id (owner_id),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      store_id    INT NOT NULL,
      rating      TINYINT NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_store (user_id, store_id),
      INDEX idx_ratings_store_id (store_id),
      INDEX idx_ratings_user_id (user_id),
      INDEX idx_ratings_created_at (created_at),
      FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      CHECK (rating >= 1 AND rating <= 5)
    )
  `);

  // seed admin user
  console.log('Checking for default admin user...');
  const [existing]: any = await connection.query(
    'SELECT id FROM users WHERE email = ?',
    ['admin@ratematrix.com']
  );

  if (existing.length === 0) {
    const hashedPwd = await bcrypt.hash('Admin@123', 10);
    await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Platform Administrator User', 'admin@ratematrix.com', hashedPwd, '123 Admin Street, Main City', 'admin']
    );
    console.log('Default admin created: admin@ratematrix.com / Admin@123');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  await connection.end();
  console.log('Seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
