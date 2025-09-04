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

    // Check if signup is enabled (unless no users exist)
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
            console.error('Database error checking user count:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const isFirstUser = row.count === 0;
        
        if (!isFirstUser) {
            // Check if signup is enabled
            db.get('SELECT value FROM settings WHERE key = ?', ['signup_enabled'], (err, setting) => {
                if (err) {
                    console.error('Database error checking signup setting:', err);
                    return res.status(500).json({ message: 'Database error' });
                }
                
                if (!setting || setting.value !== 'true') {
                    return res.status(403).json({ message: 'User registration is currently disabled. Contact the administrator.' });
                }
                
                createUser(username, password, 'user', res);
            });
        } else {
            // First user becomes admin
            createUser(username, password, 'admin', res);
        }
    });
});

function createUser(username, password, role, res) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.run(sql, [username, hashedPassword, role], function(err) {
        if (err) {
            console.error('Database error creating user:', err);
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const message = role === 'admin' 
            ? `Admin account created successfully! You are now the administrator.`
            : 'User registered successfully';
            
        res.status(201).json({ 
            message, 
            userId: this.lastID,
            role: role
        });
    });
}

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

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role, location: user.location }
        });
    });
});

// GET /api/auth/signup-status - Check if signup is enabled
router.get('/signup-status', (req, res) => {
    db.get('SELECT value FROM settings WHERE key = ?', ['signup_enabled'], (err, row) => {
        if (err) {
            console.error('Database error checking signup status:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        const signupEnabled = row ? row.value === 'true' : true;
        res.json({ signupEnabled });
    });
});

// POST /api/auth/toggle-signup - Admin only: Toggle signup on/off
router.post('/toggle-signup', authenticateToken, (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { enabled } = req.body;
    const value = enabled ? 'true' : 'false';
    
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 
           ['signup_enabled', value], 
           function(err) {
        if (err) {
            console.error('Database error updating signup setting:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({ 
            message: `User registration ${enabled ? 'enabled' : 'disabled'}`,
            signupEnabled: enabled
        });
    });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

module.exports = router;
