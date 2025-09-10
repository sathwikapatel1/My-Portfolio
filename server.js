// server.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL connection pool using environment variables
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,     // e.g. "aws.connect.psdb.cloud"
  user: process.env.DB_USER,     // e.g. "username"
  password: process.env.DB_PASS, // e.g. "password"
  database: process.env.DB_NAME, // e.g. "portfolio"
  port: process.env.DB_PORT || 3306, // optional, default MySQL port
  ssl: {
    rejectUnauthorized: true     // needed for some cloud DBs like PlanetScale
  }
});

// ✅ Test DB connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully!");
    conn.release();
  }
});

// ✅ Contact form route
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, Email, and Message are required" });
  }

  const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
  pool.query(sql, [name, email, subject, message], (err, result) => {
    if (err) {
      console.error("❌ DB error on /contact:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("✅ New contact saved:", { name, email, subject });
    res.json({ success: true, message: "Message sent successfully!" });
  });
});

// ✅ Render requires listening on process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
