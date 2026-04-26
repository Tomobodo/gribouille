import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { Navbar } from '../components/ui/Navbar';
import { Card } from '../components/ui/Card';
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

  const sortOptions = (opts: { date: string, start_time: string }[]) => {
    return [...opts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const addOption = (days: number = 1) => {
    const lastDate = options.length > 0 ? new Date(options[options.length - 1].date) : new Date();
    const newDate = format(addDays(lastDate, days), 'yyyy-MM-dd');
    setOptions(sortOptions([...options, { date: newDate, start_time: '19:00' }]));
  };

  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = value;
    setOptions(sortOptions(newOptions));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => !o.date)) {
      setError('Toutes les dates doivent être renseignées');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          address,
          organizer_password: orgPassword,
          options
        }),
      });
      navigate(`/event/${res.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Card title="Créer un nouvel événement">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Titre de l'événement" 
              placeholder="Ex: Soirée Raclette, Anniversaire de Tom..."
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            
            <TextArea 
              label="Description (optionnel)" 
              placeholder="Dis à tes potes de quoi il s'agit..."
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3} 
            />
            
            <Input 
              label="Lieu ou Adresse" 
              placeholder="Ex: Chez moi, 12 rue du bar, ou un lien Google Maps..."
              value={address} 
              onChange={e => setAddress(e.target.value)} 
            />
            
            <Input 
              label="Mot de passe organisateur" 
              type="password"
              placeholder="Pour pouvoir gérer l'événement plus tard"
              value={orgPassword} 
              onChange={e => setOrgPassword(e.target.value)} 
              required 
            />

            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Dates et horaires</h3>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => addOption(1)} className="text-sm py-1">
                    <Plus size={16} className="inline mr-1" /> J+1
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => addOption(7)} className="text-sm py-1">
                    <Plus size={16} className="inline mr-1" /> J+7
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <input 
                        type="date" 
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                        value={opt.date} 
                        onChange={e => updateOption(index, 'date', e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="w-32">
                      <input 
                        type="time" 
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" 
                        value={opt.start_time} 
                        onChange={e => updateOption(index, 'start_time', e.target.value)} 
                      />
                    </div>
                    {options.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeOption(index)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">{error}</div>}
            
            <div className="pt-6">
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Création en cours...' : "Créer l'événement"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};
