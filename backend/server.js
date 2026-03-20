const bcrypt = require('bcrypt');
const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/public")));


const session = require("express-session");

app.use(
  session({
    secret: "superSecretKey123", 
    resave: false,
    saveUninitialized: false
  })
);




// connect to mariadb
const db = mysql.createConnection({
  host: "localhost",
  user: "budget_user",
  password: "mypassword",
  database: "budget_scholar"
});

// connection check
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("connected to mariadb");
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

// Add Transaction
app.post("/add-transaction", (req, res) => {
  const { user_id, type, category_id, amount } = req.body;

  if (!user_id || !type || !category_id || !amount) {
    return res.status(400).send("Missing required fields");
  }

  const sql = `
    INSERT INTO transactions (user_id, type, category_id, amount, date)
    VALUES (?, ?, ?, ?, CURDATE());
  `;

  db.query(sql, [user_id, type, category_id, amount], (err, result) => {
    if (err) {
      console.error("Error running query:", err);
      return res.status(500).send("Database insert failed");
    }
    res.send("Transaction added successfully!");
  });
});

//Budget Summary
app.get("/budget-summary/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT 
      b.id AS budget_id,
      c.name AS category,
      b.amount AS budget_amount,
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
      console.error("Error:", err);
      return res.status(500).send("Database error");
    }
    res.json(rows);
  });
});

// Add Budget
app.post("/add-budget", (req, res) => {
  const { user_id, category_id, amount, period } = req.body;

  if (!user_id || !category_id || !amount) {
    return res.status(400).send("Missing required fields");
  }

  const sql = `
    INSERT INTO budgets (user_id, category_id, amount, period)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, category_id, amount, period || 'monthly'], (err) => {
    if (err) {
      console.error("Error adding budget:", err);
      return res.status(500).send("Database insert failed");
    }
    res.send("Budget added successfully!");
  });
});

//registration route
app.post("/register", async(req, res) => {
  const{username, password} = req.body;

  if (!username || !password){
    return res.status(400).send("Missing username or password");
  }
  const hashed = await bcrypt.hash(password, 10);

  const sql = "INSERT into users (username, password) VALUES (?,?)";

  db.query(sql, [username, hashed], (err, result)=>{
    if (err){
      console.error(err);
      return res.status(500).send("Registration failed");
    }
    res.send("User registered");
  });
});

//login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, rows) => {
    if (err) return res.status(500).send("DB error");

    if (rows.length === 0) return res.status(400).send("User not found");

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).send("Wrong password");

    req.session.userId = user.id;

    res.send("Login successful");
  });
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/login.html"));
});


//protect routes
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(403).send("Not logged in");
  next();
}

app.get("/budget-dashboard", requireLogin, (req, res) => {
  res.sendFile(__dirname + "../backend/budget-dashboard.html");
});



// Budget Dashboard Page
app.get("/budget-dashboard", (req, res) => {
  res.sendFile(__dirname + "../backend/budget-dashboard.html");
});

// HOME PAGE (MUST BE LAST)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname , '../frontend/public/index.html'));
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
