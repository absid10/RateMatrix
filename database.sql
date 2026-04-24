-- Run these commands in MySQL Workbench to set up the database

CREATE DATABASE IF NOT EXISTS ratematrix;
USE ratematrix;

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
);

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
);

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
);

-- Note: The password hash below corresponds to 'Admin@123'
INSERT IGNORE INTO users (name, email, password, address, role) 
VALUES (
  'Platform Administrator User', 
  'admin@ratematrix.com', 
  '$2a$10$Dje9vPetlCIYgXrT5VPRruUrrOKjlDhXXslrd0tj9osx4CD/d6fu.', -- Hashed version of Admin@123
  '123 Admin Street, Main City', 
  'admin'
);
