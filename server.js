require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files correctly (public folder)
app.use(express.static(__dirname));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));


// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL Database");
});

// Serve portfolio.html on the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "portfolio.html"));
});

// Handle Contact Form Submission
app.post("/contact", (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).send("All fields are required!");
    }

    const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, subject, message], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            res.status(500).send("Database error");
        } else {
            res.status(200).send("Message received successfully!");
        }
    });
});

// Start Server
const PORT = process.env.port || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
