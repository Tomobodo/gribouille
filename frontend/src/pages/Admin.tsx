import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { format, addDays } from 'date-fns';

export const Admin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [event, setEvent] = useState<any>(null);
  
  // Edit State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'deleting'>('idle');

  const checkPassword = async () => {
    setStatus('loading');
    try {
      const res = await apiRequest(`/events/${id}/admin/login`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (res.success) {
        const eventData = await apiRequest(`/events/${id}`);
        setEvent(eventData);
        setTitle(eventData.title);
        setDescription(eventData.description || '');
        setAddress(eventData.address || '');
        setOptions(eventData.options.map((o: any) => ({ date: o.date, start_time: o.start_time })));
        setIsAuthenticated(true);
        setStatus('idle');
      }
    } catch (err) {
      setError('Mot de passe incorrect');
      setStatus('idle');
    }
  };

  const sortOptions = (opts: any[]) => [...opts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addOption = (days: number = 1) => {
    const lastDate = options.length > 0 ? new Date(options[options.length - 1].date) : new Date();
    const newDate = format(addDays(lastDate, days), 'yyyy-MM-dd');
    setOptions(sortOptions([...options, { date: newDate, start_time: '19:00' }]));
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(sortOptions(newOptions));
  };

  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));

  const handleUpdate = async () => {
    setStatus('saving');
    try {
      await apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, address, organizer_password: password, options }),
      });
      navigate(`/event/${id}`);
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Es-tu sûr de vouloir supprimer cet événement ?')) return;
    setStatus('deleting');
    try {
      await apiRequest(`/events/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-12">
          <Card title="Authentification Admin">
            <Input label="Mot de passe organisateur" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <Button fullWidth onClick={checkPassword} disabled={status === 'loading'}>
              {status === 'loading' ? 'Vérification...' : 'Accéder au panel'}
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Card title="Modifier l'événement">
          <Input label="Titre" value={title} onChange={e => setTitle(e.target.value)} />
          <TextArea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input label="Adresse" value={address} onChange={e => setAddress(e.target.value)} />

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Dates</h3>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => addOption(1)} className="text-xs">J+1</Button>
                <Button variant="secondary" onClick={() => addOption(7)} className="text-xs">J+7</Button>
              </div>
            </div>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="date" className="border rounded px-2 py-1 flex-1" value={opt.date} onChange={e => updateOption(i, 'date', e.target.value)} />
                <input type="time" className="border rounded px-2 py-1 w-24" value={opt.start_time} onChange={e => updateOption(i, 'start_time', e.target.value)} />
                <Button variant="danger" onClick={() => removeOption(i)}><Trash2 size={16}/></Button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Button onClick={handleUpdate} disabled={status === 'saving'} className="flex-1 flex justify-center items-center gap-2">
              {status === 'saving' ? <Loader2 className="animate-spin" /> : <Save size={18}/>} Enregistrer
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={status === 'deleting'}>Supprimer</Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
