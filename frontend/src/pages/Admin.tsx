import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { format, addDays } from 'date-fns';

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
  const addOption = (days: number = 1) => {
    const last = options.length > 0 ? new Date(options[options.length - 1].date) : new Date();
    setOptions(sortOptions([...options, { date: format(addDays(last, days), 'yyyy-MM-dd'), start_time: '19:00' }]));
  };
  const updateOption = (i: number, f: string, v: string) => { const n = [...options]; n[i][f] = v; setOptions(sortOptions(n)); };
  const removeOption = (i: number) => setOptions(options.filter((_, j) => j !== i));

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-papier">
        <Navbar />
        <main className="max-w-sm mx-auto px-6 py-24">
          <h1 className="handwriting text-5xl text-encre mb-8">Espace orga 🔑</h1>
          <div className="bg-white border-2 border-encre p-6">
            <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
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
          <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input label="Lieu" value={address} onChange={e => setAddress(e.target.value)} />

          <div className="pt-6 mt-2 border-t-2 border-trait">
            <div className="flex justify-between items-center mb-4">
              <span className="handwriting text-xl text-encre">Créneaux</span>
              <div className="flex gap-2">
                <button onClick={() => addOption(1)} className="handwriting text-base text-stone-500 border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                  <Plus size={13} /> J+1
                </button>
                <button onClick={() => addOption(7)} className="handwriting text-base text-stone-500 border-2 border-trait px-3 py-1 hover:border-encre hover:text-encre transition-colors flex items-center gap-1">
                  <Plus size={13} /> Sem+1
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-3 items-center bg-papier border-2 border-trait px-4 py-3">
                  <span className="handwriting text-rouge text-lg w-5">{i + 1}.</span>
                  <input type="date" className="flex-1 bg-transparent text-encre text-sm focus:outline-none" value={opt.date} onChange={e => updateOption(i, 'date', e.target.value)} />
                  <span className="text-trait">|</span>
                  <input type="time" className="w-24 bg-transparent text-encre text-sm focus:outline-none" value={opt.start_time} onChange={e => updateOption(i, 'start_time', e.target.value)} />
                  <button onClick={() => removeOption(i)} className="text-crayon hover:text-rouge transition-colors">
                    <Trash2 size={15} />
                  </button>
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
    </div>
  );
};
