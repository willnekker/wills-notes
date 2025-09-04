const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// GET /api/notebooks
router.get('/', protect, (req, res) => {
    const sql = 'SELECT * FROM notebooks WHERE userId = ? ORDER BY name';
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(rows);
    });
});

// POST /api/notebooks
router.post('/', protect, (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO notebooks (name, userId) VALUES (?, ?)';
    db.run(sql, [name, req.user.id], function(err) {
        if (err) return res.status(400).json({ message: 'Error creating notebook' });
        res.status(201).json({ id: this.lastID, name, userId: req.user.id });
    });
});

// PUT /api/notebooks/:id
router.put('/:id', protect, (req, res) => {
    const { name } = req.body;
    const sql = 'UPDATE notebooks SET name = ? WHERE id = ? AND userId = ?';
    db.run(sql, [name, req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: 'Error updating notebook' });
        if (this.changes === 0) return res.status(404).json({ message: 'Notebook not found or not owned by user' });
        res.json({ message: 'Notebook updated' });
    });
});

// DELETE /api/notebooks/:id
router.delete('/:id', protect, (req, res) => {
    const sql = 'DELETE FROM notebooks WHERE id = ? AND userId = ?';
    db.run(sql, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: 'Error deleting notebook' });
        if (this.changes === 0) return res.status(404).json({ message: 'Notebook not found or not owned by user' });
        res.json({ message: 'Notebook deleted' });
    });
});

module.exports = router;
