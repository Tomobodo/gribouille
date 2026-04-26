import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Check, Share2, Crown } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navbar } from '../components/ui/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface Option {
  id: string;
  date: string;
  start_time: string;
  votes: string[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  address: string;
  options: Option[];
}

export const EventView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [voterName, setVoterName] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchEvent = async () => {
    try {
      const data = await apiRequest(`/events/${id}`);
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) ? prev.filter(i => i !== optionId) : [...prev, optionId]
    );
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName) return;
    try {
      await apiRequest(`/events/${id}/votes`, {
        method: 'POST',
        body: JSON.stringify({ voter_name: voterName, option_ids: selectedOptions }),
      });
      setVoterName('');
      setSelectedOptions([]);
      fetchEvent();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
        <p className="text-gray-600 mb-6">Cet événement n'existe pas ou a été supprimé.</p>
        <Link to="/"><Button>Retour à l'accueil</Button></Link>
      </div>
    </div>
  );

  const mapsUrl = event.address?.startsWith('http') 
    ? event.address 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || '')}`;

  const allVoters = Array.from(new Set(event.options.flatMap(o => o.votes)));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">{event.title}</h1>
            {event.description && <p className="text-gray-600 mb-2">{event.description}</p>}
            {event.address && (
              <div className="flex items-center text-blue-600 text-sm">
                <MapPin size={16} className="mr-1" />
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {event.address}
                </a>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" onClick={copyLink} className="flex-1 md:flex-none flex items-center justify-center gap-2">
              <Share2 size={16} />
              {copied ? 'Copié !' : 'Partager'}
            </Button>
            <Link to={`/event/${id}/admin`} className="flex-1 md:flex-none">
              <Button variant="ghost" className="w-full flex items-center justify-center gap-2">
                <Crown size={16} />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        <Card className="p-0 shadow-lg border-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gray-50 z-10 w-48">
                    Participants ({allVoters.length})
                  </th>
                  {event.options.map(opt => (
                    <th key={opt.id} className="p-4 text-center border-l border-gray-100 min-w-[120px]">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
                        {format(new Date(opt.date), 'EEE d MMM', { locale: fr })}
                      </div>
                      <div className="text-lg font-extrabold text-gray-900">{opt.start_time || '--:--'}</div>
                      <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 py-1 rounded-full">
                        {opt.votes.length} vote{opt.votes.length > 1 ? 's' : ''}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allVoters.map(voter => (
                  <tr key={voter} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      {voter}
                    </td>
                    {event.options.map(opt => (
                      <td key={opt.id} className="p-4 text-center border-l border-gray-50">
                        {opt.votes.includes(voter) ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                            <Check size={20} strokeWidth={3} />
                          </div>
                        ) : (
                          <span className="text-gray-200">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Voting Row */}
                <tr className="bg-blue-50/50">
                  <td className="p-4 sticky left-0 bg-blue-50 z-10 border-r border-blue-100">
                    <input 
                      className="w-full px-3 py-2 border border-blue-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
                      placeholder="Ton nom..." 
                      value={voterName} 
                      onChange={e => setVoterName(e.target.value)} 
                    />
                  </td>
                  {event.options.map(opt => (
                    <td key={opt.id} className="p-4 text-center border-l border-blue-100">
                      <label className="flex flex-col items-center justify-center cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={selectedOptions.includes(opt.id)} 
                          onChange={() => toggleOption(opt.id)}
                        />
                        <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedOptions.includes(opt.id) 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                          : 'bg-white border-blue-200 text-transparent group-hover:border-blue-400'
                        }`}>
                          <Check size={24} strokeWidth={3} />
                        </div>
                      </label>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
            <p className="text-sm text-gray-500 italic">
              {voterName ? `Prêt à voter en tant que "${voterName}"` : "Entre ton nom pour voter"}
            </p>
            <Button 
              onClick={handleVote} 
              disabled={!voterName || selectedOptions.length === 0}
              className="px-10"
            >
              Enregistrer mes disponibilités
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
