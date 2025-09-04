const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// GET /api/search?q=...
router.get('/', protect, (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    // FTS5 queries need to be sanitized. We append '*' to make it a prefix search.
    const ftsQuery = query.trim().split(/\s+/).map(term => `${term}*`).join(' ');

    const sql = `
        SELECT n.id, n.title, n.notebookId, snippet(notes_fts, 1, '<b>', '</b>', '...', 15) as snippet
        FROM notes_fts
        JOIN notes n ON notes_fts.rowid = n.id
        WHERE notes_fts MATCH ? AND n.userId = ?
        ORDER BY rank
    `;

    db.all(sql, [ftsQuery, req.user.id], (err, rows) => {
        if (err) {
            console.error("FTS Search Error:", err);
            return res.status(500).json({ message: 'Error performing search' });
        }
        res.json(rows);
    });
});

module.exports = router;
