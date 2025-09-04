const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// GET /api/user/profile
router.get('/profile', protect, (req, res) => {
    const sql = 'SELECT id, username, location, role FROM users WHERE id = ?';
    db.get(sql, [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching profile' });
        }
        res.json(row);
    });
});

// PUT /api/user/profile
router.put('/profile', protect, (req, res) => {
    const { location } = req.body;
    const sql = 'UPDATE users SET location = ? WHERE id = ?';
    db.run(sql, [location, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating profile' });
        }
        res.json({ message: 'Profile updated successfully', location });
    });
});

module.exports = router;
