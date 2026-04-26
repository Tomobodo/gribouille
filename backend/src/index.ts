import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create event
app.post('/api/events', (req, res) => {
  const { title, description, address, organizer_password, options } = req.body;
  const eventId = uuidv4();

  try {
    const insertEvent = db.prepare('INSERT INTO events (id, title, description, address, organizer_password) VALUES (?, ?, ?, ?, ?)');
    insertEvent.run(eventId, title, description, address, organizer_password);

    const insertOption = db.prepare('INSERT INTO options (id, event_id, date, start_time) VALUES (?, ?, ?, ?)');
    for (const opt of options) {
      insertOption.run(uuidv4(), eventId, opt.date, opt.start_time);
    }

    res.json({ id: eventId });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get event
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const event = db.prepare('SELECT id, title, description, address FROM events WHERE id = ?').get(id) as any;
  
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const options = db.prepare('SELECT id, date, start_time FROM options WHERE event_id = ?').all(id) as any[];
  
  const optionsWithVotes = options.map(opt => {
    const votes = db.prepare('SELECT voter_name FROM votes WHERE option_id = ?').all(opt.id) as any[];
    return { ...opt, votes: votes.map(v => v.voter_name) };
  });

  res.json({ ...event, options: optionsWithVotes });
});

// Vote
app.post('/api/events/:id/votes', (req, res) => {
  const { voter_name, option_ids } = req.body;

  try {
    const transaction = db.transaction(() => {
      const insertVote = db.prepare('INSERT INTO votes (option_id, voter_name) VALUES (?, ?)');
      for (const optId of option_ids) {
        insertVote.run(optId, voter_name);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, address, organizer_password, options } = req.body;

  const event = db.prepare('SELECT organizer_password FROM events WHERE id = ?').get(id) as any;
  if (!event || event.organizer_password !== organizer_password) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const transaction = db.transaction(() => {
      db.prepare('UPDATE events SET title = ?, description = ?, address = ? WHERE id = ?').run(title, description, address, id);
      db.prepare('DELETE FROM options WHERE event_id = ?').run(id);
      const insertOption = db.prepare('INSERT INTO options (id, event_id, date, start_time) VALUES (?, ?, ?, ?)');
      for (const opt of options) {
        insertOption.run(uuidv4(), id, opt.date, opt.start_time);
      }
    });
    transaction();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/events/:id/admin/login', (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const event = db.prepare('SELECT organizer_password FROM events WHERE id = ?').get(id) as any;
  
  if (event && event.organizer_password === password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid organizer password' });
  }
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const event = db.prepare('SELECT organizer_password FROM events WHERE id = ?').get(id) as any;

  if (event && event.organizer_password === password) {
    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
