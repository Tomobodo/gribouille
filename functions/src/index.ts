import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

initializeApp();
const db = getFirestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '16kb' }));

// --- Validation ---

function validateEvent(body: any): string | null {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) return 'title requis';
  if (body.title.length > 200) return 'title trop long (max 200)';
  if (body.description && body.description.length > 2000) return 'description trop longue (max 2000)';
  if (body.address && body.address.length > 500) return 'adresse trop longue (max 500)';
  if (!body.organizer_password || body.organizer_password.length < 4) return 'mot de passe requis (min 4 caractères)';
  if (body.organizer_password.length > 100) return 'mot de passe trop long';
  if (!Array.isArray(body.options) || body.options.length === 0) return 'au moins une option requise';
  if (body.options.length > 30) return 'trop d\'options (max 30)';
  for (const opt of body.options) {
    if (!opt.date || typeof opt.date !== 'string') return 'date invalide dans les options';
  }
  return null;
}

// --- Routes ---

app.post('/api/events', async (req, res) => {
  const error = validateEvent(req.body);
  if (error) { res.status(400).json({ error }); return; }

  const { title, description, address, organizer_password, options } = req.body;
  const eventId = uuidv4();
  try {
    const hashedPassword = await bcrypt.hash(organizer_password, 10);
    const eventRef = db.collection('events').doc(eventId);
    await eventRef.set({
      title: title.trim(),
      description: description?.trim() ?? '',
      address: address?.trim() ?? '',
      organizer_password: hashedPassword,
      created_at: new Date(),
    });
    for (const opt of options) {
      await eventRef.collection('options').doc(uuidv4()).set({
        date: opt.date,
        start_time: opt.start_time ?? null,
      });
    }
    res.json({ id: eventId });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventSnap = await db.collection('events').doc(id).get();
    if (!eventSnap.exists) { res.status(404).json({ error: 'Event not found' }); return; }

    const data = eventSnap.data()!;
    const event = { id: eventSnap.id, title: data.title, description: data.description, address: data.address };

    const optionsSnap = await db.collection('events').doc(id).collection('options').get();
    const options = await Promise.all(optionsSnap.docs.map(async (optDoc) => {
      const votesSnap = await optDoc.ref.collection('votes').get();
      return { id: optDoc.id, ...optDoc.data(), votes: votesSnap.docs.map((v) => v.data().voter_name) };
    }));

    res.json({ ...event, options });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/events/:id/votes', async (req, res) => {
  const { voter_name, option_ids } = req.body;
  const { id } = req.params;

  if (!voter_name || typeof voter_name !== 'string' || voter_name.trim().length === 0) {
    res.status(400).json({ error: 'voter_name requis' }); return;
  }
  if (voter_name.length > 100) { res.status(400).json({ error: 'nom trop long' }); return; }
  if (!Array.isArray(option_ids) || option_ids.length === 0) {
    res.status(400).json({ error: 'option_ids requis' }); return;
  }

  try {
    // Vérifie que toutes les options appartiennent bien à cet event
    const eventRef = db.collection('events').doc(id);
    const validOptions = await eventRef.collection('options').get();
    const validIds = new Set(validOptions.docs.map((d) => d.id));
    for (const optId of option_ids) {
      if (!validIds.has(optId)) {
        res.status(400).json({ error: 'option invalide' }); return;
      }
    }

    const batch = db.batch();
    for (const optId of option_ids) {
      const voteRef = eventRef.collection('options').doc(optId).collection('votes').doc();
      batch.set(voteRef, { voter_name: voter_name.trim() });
    }
    await batch.commit();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { organizer_password } = req.body;
  const error = validateEvent(req.body);
  if (error) { res.status(400).json({ error }); return; }

  const { title, description, address, options } = req.body;
  try {
    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) { res.status(404).json({ error: 'Event not found' }); return; }

    const valid = await bcrypt.compare(organizer_password, eventSnap.data()!.organizer_password);
    if (!valid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await eventRef.update({ title: title.trim(), description: description?.trim() ?? '', address: address?.trim() ?? '' });

    const oldOptions = await eventRef.collection('options').get();
    const deleteBatch = db.batch();
    for (const optDoc of oldOptions.docs) {
      const votes = await optDoc.ref.collection('votes').get();
      votes.docs.forEach((v) => deleteBatch.delete(v.ref));
      deleteBatch.delete(optDoc.ref);
    }
    await deleteBatch.commit();

    for (const opt of options) {
      await eventRef.collection('options').doc(uuidv4()).set({
        date: opt.date,
        start_time: opt.start_time ?? null,
      });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/events/:id/admin/login', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) { res.status(400).json({ error: 'password requis' }); return; }

  try {
    const eventSnap = await db.collection('events').doc(id).get();
    if (!eventSnap.exists) { res.status(401).json({ error: 'Invalid organizer password' }); return; }

    const valid = await bcrypt.compare(password, eventSnap.data()!.organizer_password);
    if (valid) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid organizer password' });
    }
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) { res.status(400).json({ error: 'password requis' }); return; }

  try {
    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const valid = await bcrypt.compare(password, eventSnap.data()!.organizer_password);
    if (!valid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const options = await eventRef.collection('options').get();
    const batch = db.batch();
    for (const optDoc of options.docs) {
      const votes = await optDoc.ref.collection('votes').get();
      votes.docs.forEach((v) => batch.delete(v.ref));
      batch.delete(optDoc.ref);
    }
    batch.delete(eventRef);
    await batch.commit();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export const api = onRequest({ region: 'europe-west1' }, app);
