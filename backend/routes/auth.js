const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.get(sql, [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: { id: user.id, username: user.username, location: user.location }
        });
    });
});

module.exports = router;
