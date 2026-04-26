import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Input } from '../components/ui/Input';
import { MarkdownField } from '../components/ui/MarkdownField';
import { Button } from '../components/ui/Button';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RecurringDateModal } from '../components/ui/RecurringDateModal';

export const Admin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'deleting'>('idle');
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [editingTime, setEditingTime] = useState<number | null>(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingDate !== null && dateRef.current) {
      const el = dateRef.current;
      el.focus();
      try { (el as any).showPicker?.(); } catch {}
    }
  }, [editingDate]);

  useEffect(() => {
    if (editingTime !== null && timeRef.current) {
      const el = timeRef.current;
      el.focus();
      try { (el as any).showPicker?.(); } catch {}
    }
  }, [editingTime]);

  const checkPassword = async () => {
    setStatus('loading'); setError('');
    try {
      await apiRequest(`/events/${id}/admin/login`, { method: 'POST', body: JSON.stringify({ password }) });
      const data = await apiRequest(`/events/${id}`);
      setTitle(data.title); setDescription(data.description || ''); setAddress(data.address || '');
      setOptions(data.options.map((o: any) => ({ date: o.date, start_time: o.start_time })));
      setIsAuthenticated(true);
    } catch { setError('Mot de passe incorrect 😬'); }
    finally { setStatus('idle'); }
  };

  const sortOptions = (opts: any[]) => [...opts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addOption = () => {
    const last = options.length > 0 ? options[options.length - 1] : null;
    const baseDate = last ? new Date(last.date + 'T00:00:00') : new Date();
    const time = last?.start_time ?? '19:00';
    setOptions(sortOptions([...options, { date: format(addDays(baseDate, 1), 'yyyy-MM-dd'), start_time: time }]));
  };

  const addOptionRelativeTo = (i: number, days: number) => {
    const base = new Date(options[i].date + 'T00:00:00');
    setOptions(sortOptions([...options, { date: format(addDays(base, days), 'yyyy-MM-dd'), start_time: options[i].start_time }]));
  };

  const duplicateOption = (i: number) => {
    setOptions(sortOptions([...options, { ...options[i] }]));
  };

  const updateOption = (i: number, f: string, v: string) => { const n = [...options]; n[i][f] = v; setOptions(sortOptions(n)); };
  const removeOption = (i: number) => setOptions(options.filter((_, j) => j !== i));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Choisir une date';
    const d = format(new Date(dateStr + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr });
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  const handleAddRecurring = (dates: { date: string; start_time: string }[]) => {
    setOptions(sortOptions([...options, ...dates]));
    setShowRecurring(false);
  };

  const handleUpdate = async () => {
    setStatus('saving');
    try {
      await apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify({ title, description, address, organizer_password: password, options }) });
      navigate(`/event/${id}`);
    } catch (err: any) { setError(err.message); setStatus('idle'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cet événement ?')) return;
    setStatus('deleting');
    try {
      await apiRequest(`/events/${id}`, { method: 'DELETE', body: JSON.stringify({ password }) });
      navigate('/');
    } catch (err: any) { setError(err.message); setStatus('idle'); }
  };

  const rowActionButtons = (i: number) => (
    <div className="flex gap-1">
      <button type="button" onClick={() => addOptionRelativeTo(i, 1)} className="handwriting text-base text-crayon border border-trait px-2 py-0.5 hover:border-encre hover:text-encre transition-colors flex items-center gap-0.5">
        <Plus size={11} /> J+1
      </button>
      <button type="button" onClick={() => addOptionRelativeTo(i, 7)} className="handwriting text-base text-crayon border border-trait px-2 py-0.5 hover:border-encre hover:text-encre transition-colors flex items-center gap-0.5">
        <Plus size={11} /> J+7
      </button>
      <button type="button" onClick={() => duplicateOption(i)} className="handwriting text-base text-crayon border border-trait px-2 py-0.5 hover:border-encre hover:text-encre transition-colors flex items-center gap-0.5">
        <Copy size={11} /> Dupliquer
      </button>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-papier">
        <Navbar />
        <main className="max-w-sm mx-auto px-6 py-24">
          <h1 className="handwriting text-5xl text-encre mb-8">Espace orga 🔑</h1>
          <div className="bg-white border-2 border-encre p-6">
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              data-lpignore="true"
              data-form-type="other"
            />
            {error && <p className="handwriting text-rouge text-lg mb-4">{error}</p>}
            <Button fullWidth onClick={checkPassword} disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Accéder →'}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="handwriting text-5xl text-encre mb-8">Modifier l'événement ✏️</h1>

        <div className="bg-white border-2 border-encre p-8 mb-6">
          <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <MarkdownField label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={6} />
          <Input label="Lieu" value={address} onChange={e => setAddress(e.target.value)} />

          <div className="pt-6 mt-2 border-t-2 border-trait">
            <div className="flex justify-between items-center mb-4">
              <span className="handwriting text-xl text-encre">Créneaux</span>
              <div className="flex gap-2">
                <button onClick={addOption} className="handwriting text-lg text-crayon border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                  <Plus size={13} /> Ajouter une date
                </button>
                <button onClick={() => setShowRecurring(true)} className="handwriting text-lg text-crayon border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                  <Plus size={13} /> Dates récurrentes
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="bg-papier border-2 border-trait">
                  <div className="flex gap-3 items-center px-4 py-3">
                    <span className="handwriting text-rouge text-lg w-5 flex-shrink-0">{i + 1}.</span>

                    {editingDate === i ? (
                      <input
                        ref={dateRef}
                        type="date"
                        className="flex-1 bg-white border border-trait px-2 py-1 text-encre text-sm focus:outline-none focus:border-encre"
                        value={opt.date}
                        onChange={e => { updateOption(i, 'date', e.target.value); setEditingDate(null); }}
                        onBlur={() => setEditingDate(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingDate(i)}
                        className="handwriting text-encre text-lg text-left flex-1 hover:text-rouge transition-colors"
                      >
                        {formatDate(opt.date)}
                      </button>
                    )}

                    <div className="hidden md:flex">{rowActionButtons(i)}</div>

                    <span className="text-trait flex-shrink-0">|</span>

                    {editingTime === i ? (
                      <input
                        ref={timeRef}
                        type="time"
                        className="w-20 bg-white border border-trait px-2 py-1 text-encre text-sm focus:outline-none focus:border-encre flex-shrink-0"
                        value={opt.start_time}
                        onChange={e => { updateOption(i, 'start_time', e.target.value); setEditingTime(null); }}
                        onBlur={() => setEditingTime(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingTime(i)}
                        className="handwriting text-encre text-lg flex-shrink-0 hover:text-rouge transition-colors w-16 text-center"
                      >
                        {opt.start_time || '—'}
                      </button>
                    )}

                    <button onClick={() => removeOption(i)} className="text-crayon hover:text-rouge transition-colors flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex md:hidden gap-1 px-3 pb-2 border-t border-trait pt-2">
                    {rowActionButtons(i)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="handwriting text-rouge text-lg mb-4">{error}</p>}

        <div className="flex gap-4">
          <Button onClick={handleUpdate} disabled={status === 'saving'} className="flex-1">
            {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer →'}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={status === 'deleting'}>
            {status === 'deleting' ? <Loader2 size={16} className="animate-spin" /> : 'Supprimer'}
          </Button>
        </div>
      </main>

      {showRecurring && (
        <RecurringDateModal onAdd={handleAddRecurring} onClose={() => setShowRecurring(false)} />
      )}
    </div>
  );
};
