require('dotenv').config();

const bcrypt = require('bcrypt');
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — only needed in local dev (in production the backend serves the frontend directly)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
}

const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "superSecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
);

// connect to database
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "budget_user",
  password: process.env.DB_PASSWORD || "mypassword",
  database: process.env.DB_NAME || "budget_scholar",
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to database");
});

// GET current session user
app.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  res.json({ userId: req.session.userId, username: req.session.username });
});

// GET categories
app.get("/categories/:type", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT id, name FROM categories WHERE type = ?";
  db.query(sql, [type], (err, rows) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// GET transactions for a user
app.get("/transactions/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT t.id, t.type, t.amount, t.date, c.name AS category
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC
    LIMIT 20
  `;
  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// GET balance summary for a user
app.get("/balance/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expenses' THEN amount ELSE 0 END), 0) AS total_expenses
    FROM transactions
    WHERE user_id = ?
  `;
  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching balance:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows[0]);
  });
});

// Add Transaction
app.post("/add-transaction", (req, res) => {
  const { user_id, type, category_id, amount } = req.body;
  if (!user_id || !type || !category_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    INSERT INTO transactions (user_id, type, category_id, amount, date)
    VALUES (?, ?, ?, ?, CURDATE())
  `;
  db.query(sql, [user_id, type, category_id, amount], (err) => {
    if (err) {
      console.error("Error adding transaction:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Transaction added successfully!" });
  });
});

// GET budget summary
app.get("/budget-summary/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const sql = `
    SELECT
      b.id AS budget_id,
      b.name AS budget_name,
      c.name AS category,
      b.amount AS budget_amount,
      b.period,
      (SELECT COALESCE(SUM(t.amount), 0)
       FROM transactions t
       WHERE t.category_id = b.category_id
         AND t.user_id = b.user_id
         AND t.type = 'expenses') AS spent
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ?
  `;
  db.query(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching budget summary:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// Add Budget
app.post("/add-budget", (req, res) => {
  const { user_id, category_id, amount, period, name } = req.body;
  if (!user_id || !category_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    INSERT INTO budgets (user_id, category_id, amount, period, name)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [user_id, category_id, amount, period || 'monthly', name || ''], (err) => {
    if (err) {
      console.error("Error adding budget:", err);
      return res.status(500).json({ error: "Database insert failed" });
    }
    res.json({ message: "Budget added successfully!" });
  });
});

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hashed], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
    res.json({ message: "User registered" });
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ message: "Login successful", userId: user.id, username: user.username });
  });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/react-client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/react-client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
