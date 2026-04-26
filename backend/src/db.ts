import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../data/database.sqlite'));

db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    organizer_password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    option_id TEXT NOT NULL,
    voter_name TEXT NOT NULL,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE
  );
`);

export default db;
