import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Copy } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Input } from '../components/ui/Input';
import { MarkdownField } from '../components/ui/MarkdownField';
import { Button } from '../components/ui/Button';
import { RecurringDateModal } from '../components/ui/RecurringDateModal';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [options, setOptions] = useState([{ date: tomorrow, start_time: '19:00' }]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const sortOptions = (opts: { date: string; start_time: string }[]) =>
    [...opts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  const removeOption = (i: number) => setOptions(options.filter((_, j) => j !== i));

  const updateOption = (i: number, field: string, value: string) => {
    const next = [...options];
    (next[i] as any)[field] = value;
    setOptions(sortOptions(next));
  };

  const handleAddRecurring = (dates: { date: string; start_time: string }[]) => {
    setOptions(sortOptions([...options, ...dates]));
    setShowRecurring(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Choisir une date';
    const d = format(new Date(dateStr + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr });
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.date)) { setError('Toutes les dates doivent être renseignées'); return; }
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({ title, description, address, organizer_password: orgPassword, options }),
      });
      navigate(`/event/${res.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="handwriting text-5xl text-encre mb-8">Nouvel événement ✏️</h1>

        <div className="bg-white border-2 border-encre p-8">
          <form onSubmit={handleSubmit}>
            <Input label="C'est quoi ?" placeholder="Soirée raclette, réu, week-end…" value={title} onChange={e => setTitle(e.target.value)} required />
            <MarkdownField label="Des détails ? (optionnel)" placeholder={"Quelques mots pour le groupe…\n\nSupporte le **markdown** : *italique*, [lien](url), listes…"} value={description} onChange={e => setDescription(e.target.value)} rows={6} />
            <Input label="Où ?" placeholder="Adresse, lieu, lien visio…" value={address} onChange={e => setAddress(e.target.value)} />
            <Input
              label="Mot de passe organisateur"
              type="password"
              placeholder="Pour modifier l'event plus tard"
              value={orgPassword}
              onChange={e => setOrgPassword(e.target.value)}
              required
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
            />

            <div className="mt-6 pt-6 border-t-2 border-trait">
              <div className="flex justify-between items-center mb-4">
                <span className="handwriting text-xl text-encre">Les créneaux proposés</span>
                <div className="flex gap-2">
                  <button type="button" onClick={addOption} className="handwriting text-lg text-crayon border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                    <Plus size={14} /> Ajouter une date
                  </button>
                  <button type="button" onClick={() => setShowRecurring(true)} className="handwriting text-lg text-crayon border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                    <Plus size={14} /> Dates récurrentes
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="bg-papier border-2 border-trait">
                    {/* Main row */}
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

                      {/* Action buttons inline on desktop */}
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

                      {options.length > 1 && (
                        <button type="button" onClick={() => removeOption(i)} className="text-crayon hover:text-rouge transition-colors flex-shrink-0">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Action buttons below on mobile */}
                    <div className="flex md:hidden gap-1 px-3 pb-2 border-t border-trait pt-2">
                      {rowActionButtons(i)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 border-l-4 border-rouge bg-papier-fonce px-4 py-3 text-rouge text-sm">
                {error}
              </div>
            )}

            <div className="mt-8">
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours…' : 'Créer le sondage →'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {showRecurring && (
        <RecurringDateModal onAdd={handleAddRecurring} onClose={() => setShowRecurring(false)} />
      )}
    </div>
  );
};
