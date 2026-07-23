require('dotenv').config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const express = require("express");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Render (and most PaaS platforms) terminate HTTPS at the edge and forward
// plain HTTP internally. Without this, req.secure is always false, so the
// session cookie's `secure: true` flag silently prevents it from being set.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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
// In production, set DATABASE_URL to a single mysql://user:pass@host:port/dbname
// connection string (e.g. from TiDB Cloud). Set DB_SSL=true for hosts that
// require TLS, like TiDB Cloud.
const db = process.env.DATABASE_URL
  ? mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ...(process.env.DB_SSL === "true"
        ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
        : {})
    })
  : mysql.createConnection({
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

// Mail transporter for password reset emails — uses Gmail SMTP with an
// app password (EMAIL_USER / EMAIL_PASS). FRONTEND_URL is where the
// reset link points; set it to the deployed site's URL in production.
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// GET current session user
app.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
  res.json({ userId: req.session.userId, username: req.session.username, name: req.session.name });
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
    SELECT t.id, t.type, t.amount, t.date, t.category_id, c.name AS category
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

// Update Transaction
app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { type, category_id, amount } = req.body;
  if (!type || !category_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    UPDATE transactions SET type = ?, category_id = ?, amount = ?
    WHERE id = ?
  `;
  db.query(sql, [type, category_id, amount, id], (err) => {
    if (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ message: "Transaction updated successfully!" });
  });
});

// Delete Transaction
app.delete("/transactions/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM transactions WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).json({ error: "Database delete failed" });
    }
    res.json({ message: "Transaction deleted successfully!" });
  });
});

// GET budget summary
app.get("/budget-summary/:user_id", (req, res) => {
  const user_id = req.params.user_id;
  const sql = `
    SELECT
      b.id AS budget_id,
      b.name AS budget_name,
      b.category_id,
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

// Update Budget
app.put("/budgets/:id", (req, res) => {
  const { id } = req.params;
  const { category_id, amount, period, name } = req.body;
  if (!category_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const sql = `
    UPDATE budgets SET category_id = ?, amount = ?, period = ?, name = ?
    WHERE id = ?
  `;
  db.query(sql, [category_id, amount, period || 'monthly', name || '', id], (err) => {
    if (err) {
      console.error("Error updating budget:", err);
      return res.status(500).json({ error: "Database update failed" });
    }
    res.json({ message: "Budget updated successfully!" });
  });
});

// Delete Budget
app.delete("/budgets/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM budgets WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting budget:", err);
      return res.status(500).json({ error: "Database delete failed" });
    }
    res.json({ message: "Budget deleted successfully!" });
  });
});

// Register
app.post("/register", async (req, res) => {
  const { username, password, name, email } = req.body;
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: "Missing username, password, name, or email" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, hashed, name, email], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Username already taken" });
      }
      console.error(err);
      return res.status(500).json({ error: "Registration failed" });
    }
    res.json({ message: "User registered" });
  });
});

// Forgot Password — always responds with a generic message, whether or
// not the email is registered, so this endpoint can't be used to check
// which emails have accounts.
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const genericResponse = { message: "If that email is registered, a reset link has been sent." };

  db.query("SELECT id, username FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) {
      console.error("Error looking up user for password reset:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (rows.length === 0) return res.json(genericResponse);

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [token, expires, user.id],
      async (err) => {
        if (err) {
          console.error("Error saving reset token:", err);
          return res.status(500).json({ error: "Something went wrong" });
        }

        const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
        try {
          await mailer.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset your BudgetScholar password",
            html: `
              <p>Hi ${user.username},</p>
              <p>Click the link below to reset your BudgetScholar password. This link expires in 1 hour.</p>
              <p><a href="${resetLink}">${resetLink}</a></p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `
          });
        } catch (mailErr) {
          console.error("Error sending reset email:", mailErr);
          // Still return the generic response — don't reveal whether the send failed.
        }

        res.json(genericResponse);
      }
    );
  });
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Missing token or new password" });
  }

  db.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
    [token],
    async (err, rows) => {
      if (err) {
        console.error("Error looking up reset token:", err);
        return res.status(500).json({ error: "Something went wrong" });
      }
      if (rows.length === 0) {
        return res.status(400).json({ error: "This reset link is invalid or has expired" });
      }

      const hashed = await bcrypt.hash(password, 10);
      db.query(
        "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
        [hashed, rows[0].id],
        (err) => {
          if (err) {
            console.error("Error resetting password:", err);
            return res.status(500).json({ error: "Something went wrong" });
          }
          res.json({ message: "Password reset successfully" });
        }
      );
    }
  );
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
    req.session.name = user.name;

    res.json({ message: "Login successful", userId: user.id, username: user.username, name: user.name });
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
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/react-client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
