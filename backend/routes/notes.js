const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// GET /api/notes (all notes for a user)
router.get('/', protect, (req, res) => {
    const sql = 'SELECT * FROM notes WHERE userId = ? ORDER BY modifiedAt DESC';
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(rows);
    });
});

// GET /api/notes/notebook/:notebookId
router.get('/notebook/:notebookId', protect, (req, res) => {
    const sql = 'SELECT * FROM notes WHERE notebookId = ? AND userId = ? ORDER BY modifiedAt DESC';
    db.all(sql, [req.params.notebookId, req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(rows);
    });
});

// GET /api/notes/:id
router.get('/:id', protect, (req, res) => {
    const sql = `
        SELECT n.*, json_group_array(json_object('id', a.id, 'filename', a.filename)) as attachments
        FROM notes n
        LEFT JOIN attachments a ON n.id = a.noteId
        WHERE n.id = ? AND n.userId = ?
        GROUP BY n.id
    `;
    db.get(sql, [req.params.id, req.user.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (!row) return res.status(404).json({ message: 'Note not found' });
        // Parse the JSON string for attachments
        try {
            row.attachments = JSON.parse(row.attachments);
            // Handle case where there are no attachments, which results in [null]
            if (row.attachments.length === 1 && row.attachments[0].id === null) {
                row.attachments = [];
            }
        } catch(e) {
            row.attachments = [];
        }
        res.json(row);
    });
});

// POST /api/notes
router.post('/', protect, (req, res) => {
    const { title, content, notebookId } = req.body;
    const now = new Date().toISOString();
    const sql = 'INSERT INTO notes (title, content, createdAt, modifiedAt, userId, notebookId) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [title, content, now, now, req.user.id, notebookId], function(err) {
        if (err) return res.status(400).json({ message: 'Error creating note' });
        res.status(201).json({ id: this.lastID, title, content, createdAt: now, modifiedAt: now, userId: req.user.id, notebookId });
    });
});

// PUT /api/notes/:id
router.put('/:id', protect, (req, res) => {
    const { title, content, notebookId } = req.body;
    const now = new Date().toISOString();
    const sql = 'UPDATE notes SET title = ?, content = ?, modifiedAt = ?, notebookId = ? WHERE id = ? AND userId = ?';
    db.run(sql, [title, content, now, notebookId, req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: 'Error updating note' });
        if (this.changes === 0) return res.status(404).json({ message: 'Note not found or not owned by user' });
        res.json({ message: 'Note updated' });
    });
});

// DELETE /api/notes/:id
router.delete('/:id', protect, (req, res) => {
    const sql = 'DELETE FROM notes WHERE id = ? AND userId = ?';
    db.run(sql, [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ message: 'Error deleting note' });
        if (this.changes === 0) return res.status(404).json({ message: 'Note not found or not owned by user' });
        res.json({ message: 'Note deleted' });
    });
});

module.exports = router;
