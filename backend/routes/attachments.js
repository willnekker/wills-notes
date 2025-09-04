const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// POST /api/attachments/note/:noteId
router.post('/note/:noteId', protect, upload.single('file'), (req, res) => {
    const { noteId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const { filename, path: filepath, mimetype } = req.file;

    // Verify user owns the note before attaching
    const noteCheckSql = 'SELECT userId FROM notes WHERE id = ?';
    db.get(noteCheckSql, [noteId], (err, note) => {
        if (err || !note || note.userId !== req.user.id) {
            // If user doesn't own note, delete the orphaned uploaded file
            fs.unlinkSync(filepath);
            return res.status(403).json({ message: 'You do not have permission to attach files to this note.' });
        }

        const sql = 'INSERT INTO attachments (noteId, filename, filepath, mimetype) VALUES (?, ?, ?, ?)';
        db.run(sql, [noteId, filename, `/uploads/${filename}`, mimetype], function(err) {
            if (err) {
                fs.unlinkSync(filepath); // Clean up file if DB insert fails
                return res.status(500).json({ message: 'Failed to save attachment record.' });
            }
            res.status(201).json({ id: this.lastID, noteId, filename, filepath: `/uploads/${filename}`, mimetype });
        });
    });
});

// DELETE /api/attachments/:id
router.delete('/:id', protect, (req, res) => {
    const attachmentId = req.params.id;
    const findSql = `
        SELECT a.filepath, n.userId FROM attachments a
        JOIN notes n ON a.noteId = n.id
        WHERE a.id = ?
    `;

    db.get(findSql, [attachmentId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ message: 'Attachment not found.' });
        }
        if (row.userId !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this attachment.' });
        }

        // Delete file from filesystem
        const localPath = path.join(__dirname, '..', row.filepath);
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }

        // Delete record from database
        const deleteSql = 'DELETE FROM attachments WHERE id = ?';
        db.run(deleteSql, [attachmentId], function(err) {
            if (err) {
                return res.status(500).json({ message: 'Failed to delete attachment record.' });
            }
            res.json({ message: 'Attachment deleted successfully.' });
        });
    });
});

module.exports = router;
