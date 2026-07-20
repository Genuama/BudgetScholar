CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(100) DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income','expenses') NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT categories_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('income','expenses') NOT NULL,
  category_id INT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY category_id (category_id),
  CONSTRAINT transactions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT transactions_ibfk_2 FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS budgets (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  category_id INT DEFAULT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  period VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(100) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
