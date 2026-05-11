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
app.use(express.json({ limit: '1mb' }));

// --- Validation ---

function validateEvent(body: any): string | null {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) return 'title requis';
  if (body.title.length > 200) return 'title trop long (max 200)';
  if (body.description && body.description.length > 2000) return 'description trop longue (max 2000)';
  if (body.address && body.address.length > 500) return 'adresse trop longue (max 500)';
  if (!body.organizer_password || body.organizer_password.length < 4) return 'mot de passe requis (min 4 caractères)';
  if (body.organizer_password.length > 100) return 'mot de passe trop long';
  if (!Array.isArray(body.options) || body.options.length === 0) return 'au moins une option requise';
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
    const event = { id: eventSnap.id, title: data.title, description: data.description, address: data.address, confirmed_option_id: data.confirmed_option_id ?? null };

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

    const existingSnap = await eventRef.collection('options').get();
    const existingMap = new Map(existingSnap.docs.map(d => [d.id, d.ref]));

    // IDs of incoming options that already exist in Firestore (votes are preserved)
    const keptIds = new Set(
      (options as any[]).filter(o => o.id && existingMap.has(o.id)).map((o: any) => o.id)
    );

    // Delete options that were removed (and their votes)
    const deleteBatch = db.batch();
    for (const [optId, optRef] of existingMap) {
      if (!keptIds.has(optId)) {
        const votes = await optRef.collection('votes').get();
        votes.docs.forEach(v => deleteBatch.delete(v.ref));
        deleteBatch.delete(optRef);
      }
    }
    await deleteBatch.commit();

    // Update existing options, create new ones
    for (const opt of options as any[]) {
      if (opt.id && existingMap.has(opt.id)) {
        await existingMap.get(opt.id)!.update({ date: opt.date, start_time: opt.start_time ?? null });
      } else {
        await eventRef.collection('options').doc(uuidv4()).set({ date: opt.date, start_time: opt.start_time ?? null });
      }
    }

    // Clear confirmed_option_id only if the confirmed option was deleted
    const confirmedId = eventSnap.data()!.confirmed_option_id;
    if (confirmedId && !keptIds.has(confirmedId)) {
      await eventRef.update({ confirmed_option_id: null });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/events/:id/confirm', async (req, res) => {
  const { id } = req.params;
  const { password, option_id } = req.body;
  if (!password) { res.status(400).json({ error: 'password requis' }); return; }
  if (!option_id) { res.status(400).json({ error: 'option_id requis' }); return; }

  try {
    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) { res.status(404).json({ error: 'Event not found' }); return; }

    const valid = await bcrypt.compare(password, eventSnap.data()!.organizer_password);
    if (!valid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const optionSnap = await eventRef.collection('options').doc(option_id).get();
    if (!optionSnap.exists) { res.status(400).json({ error: 'option invalide' }); return; }

    await eventRef.update({ confirmed_option_id: option_id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/events/:id/unconfirm', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) { res.status(400).json({ error: 'password requis' }); return; }

  try {
    const eventRef = db.collection('events').doc(id);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) { res.status(404).json({ error: 'Event not found' }); return; }

    const valid = await bcrypt.compare(password, eventSnap.data()!.organizer_password);
    if (!valid) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await eventRef.update({ confirmed_option_id: null });
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

// --- Share page (OG meta + redirect) ---

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripMarkdown(s: string): string {
  return s.replace(/[#*_`\[\]()>~]/g, '').replace(/\s+/g, ' ').trim();
}

app.get('/s/:id', async (req, res) => {
  const { id } = req.params;
  const host = req.get('x-forwarded-host') || req.get('host') || '';
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const base = `${proto}://${host}`;
  const eventUrl = `${base}/event/${id}`;

  try {
    const eventSnap = await db.collection('events').doc(id).get();
    if (!eventSnap.exists) { res.redirect(302, '/'); return; }

    const data = eventSnap.data()!;
    const title = data.title as string;
    const address = (data.address as string) || '';
    const rawDesc = stripMarkdown((data.description as string) || '');
    const description = rawDesc.slice(0, 200) || (address ? `${address} · ` : '') + 'Vote pour la date qui te convient !';
    const ogTitle = `${title} — Gribouille`;

    const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(ogTitle)}</title>
  <meta name="description" content="${escHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Gribouille" />
  <meta property="og:url" content="${escHtml(eventUrl)}" />
  <meta property="og:title" content="${escHtml(ogTitle)}" />
  <meta property="og:description" content="${escHtml(description)}" />
  <meta property="og:locale" content="fr_FR" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escHtml(description)}" />
  <link rel="canonical" href="${escHtml(eventUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escHtml(eventUrl)}" />
</head>
<body>
  <script>window.location.replace(${JSON.stringify(eventUrl)});</script>
  <a href="${escHtml(eventUrl)}">${escHtml(title)} →</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.send(html);
  } catch {
    res.redirect(302, '/');
  }
});

export const api = onRequest({ region: 'europe-west1' }, app);
