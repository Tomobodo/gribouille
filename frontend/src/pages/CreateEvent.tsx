import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { format, addDays } from 'date-fns';

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

  const sortOptions = (opts: { date: string; start_time: string }[]) =>
    [...opts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addOption = (days: number = 1) => {
    const last = options.length > 0 ? new Date(options[options.length - 1].date) : new Date();
    setOptions(sortOptions([...options, { date: format(addDays(last, days), 'yyyy-MM-dd'), start_time: '19:00' }]));
  };

  const removeOption = (i: number) => setOptions(options.filter((_, j) => j !== i));

  const updateOption = (i: number, field: string, value: string) => {
    const next = [...options];
    (next[i] as any)[field] = value;
    setOptions(sortOptions(next));
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

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="handwriting text-5xl text-encre mb-8">Nouvel événement ✏️</h1>

        <div className="bg-white border-2 border-encre p-8">
          <form onSubmit={handleSubmit}>
            <Input label="C'est quoi ?" placeholder="Soirée raclette, réu, week-end…" value={title} onChange={e => setTitle(e.target.value)} required />
            <TextArea label="Des détails ? (optionnel)" placeholder="Quelques mots pour le groupe…" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <Input label="Où ?" placeholder="Adresse, lieu, lien visio…" value={address} onChange={e => setAddress(e.target.value)} />
            <Input label="Mot de passe organisateur" type="password" placeholder="Pour modifier l'event plus tard" value={orgPassword} onChange={e => setOrgPassword(e.target.value)} required />

            {/* Dates */}
            <div className="mt-6 pt-6 border-t-2 border-trait">
              <div className="flex justify-between items-center mb-4">
                <span className="handwriting text-xl text-encre">Les créneaux proposés</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => addOption(1)} className="handwriting text-base text-stone-500 border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                    <Plus size={14} /> J+1
                  </button>
                  <button type="button" onClick={() => addOption(7)} className="handwriting text-base text-stone-500 border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                    <Plus size={14} /> Sem+1
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-3 items-center bg-papier border-2 border-trait px-4 py-3 hover:border-encre transition-colors">
                    <span className="handwriting text-rouge text-lg w-5">{i + 1}.</span>
                    <input type="date" className="flex-1 bg-transparent text-encre text-sm focus:outline-none" value={opt.date} onChange={e => updateOption(i, 'date', e.target.value)} required />
                    <span className="text-trait">|</span>
                    <input type="time" className="w-24 bg-transparent text-encre text-sm focus:outline-none" value={opt.start_time} onChange={e => updateOption(i, 'start_time', e.target.value)} />
                    {options.length > 1 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-crayon hover:text-rouge transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 border-l-4 border-rouge bg-red-50 px-4 py-3 text-rouge text-sm">
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
    </div>
  );
};
