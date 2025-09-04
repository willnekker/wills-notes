const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = process.env.DB_SOURCE || 'data/notes.db';

const db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    throw err;
  }
  console.log('Connected to the SQLite database.');
  db.exec('PRAGMA foreign_keys = ON;', (err) => {
    if (err) console.error("Could not enable foreign keys:", err);
  });

  db.serialize(() => {
    console.log('Initializing database schema...');
    // User table with location for weather widget
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'user', location TEXT)`);
    // Core content tables
    db.run(`CREATE TABLE IF NOT EXISTS notebooks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, userId INTEGER, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)`);
    db.run(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT, createdAt TEXT, modifiedAt TEXT, userId INTEGER, notebookId INTEGER, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (notebookId) REFERENCES notebooks(id) ON DELETE SET NULL)`);
    // Feature tables for tags and attachments
    db.run(`CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS note_tags (noteId INTEGER NOT NULL, tagId INTEGER NOT NULL, PRIMARY KEY(noteId, tagId), FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE)`);
    db.run(`CREATE TABLE IF NOT EXISTS attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, noteId INTEGER NOT NULL, filename TEXT NOT NULL, filepath TEXT NOT NULL, mimetype TEXT, FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE)`);
    // FTS5 Virtual Table for Search
    db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(title, content, content='notes', content_rowid='id', tokenize='porter')`);
    // Triggers to keep FTS table in sync
    db.run(`CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content); END;`);
    db.run(`CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content); END;`);
    db.run(`CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN INSERT INTO notes_fts(notes_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content); INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content); END;`);
    console.log('Schema initialization complete.');
  });
});

module.exports = db;
