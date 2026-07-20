# BudgetScholar

A full-stack budgeting app for tracking income, expenses, and budgets by category.

**Live**: https://budgetscholar.onrender.com

## Features

- Account registration and login (bcrypt password hashing, session-based auth)
- Dashboard with balance overview, savings rate, and budget progress by category
- Add income/expense transactions
- Set budgets per category and period
- Recent transaction history

## Stack

- **Frontend**: React (`frontend/react-client`), React Router
- **Backend**: Node.js, Express
- **Database**: MySQL (MySQL-compatible; deployed on TiDB Cloud)
- **Hosting**: Render

## Running locally

Requires Node.js and a local MySQL-compatible server (e.g. MySQL, MariaDB).

**1. Create the database**

Create a database and run the schema in [`backend/schema.sql`](backend/schema.sql) against it.

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials and a SESSION_SECRET
npm start
```

Runs on `http://localhost:3001`.

**3. Frontend**

```bash
cd frontend/react-client
npm install
npm start
```

Runs on `http://localhost:3000` and proxies API requests to the backend.

## Deployment

The backend serves the built React app directly in production (see `server.js`). Environment variables needed in production:

- `DATABASE_URL` — MySQL connection string
- `DB_SSL` — set to `true` if the database requires TLS (e.g. TiDB Cloud)
- `NODE_ENV=production`
- `SESSION_SECRET` — a long random string
