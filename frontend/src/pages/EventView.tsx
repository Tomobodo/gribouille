import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import confetti from 'canvas-confetti';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Check, Share2, Settings } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Navbar } from '../components/ui/Navbar';
import { Button } from '../components/ui/Button';
import Markdown from 'react-markdown';

interface Option { id: string; date: string; start_time: string; votes: string[]; }
interface Event { id: string; title: string; description: string; address: string; options: Option[]; }

export const EventView = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [voterName, setVoterName] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState(false);

  usePageMeta({
    title: event?.title,
    description: event?.description
      ? event.description.replace(/[#*_`\[\]]/g, '').slice(0, 200)
      : event
        ? `${event.options?.length ?? 0} créneau${(event.options?.length ?? 0) > 1 ? 'x' : ''} proposé${(event.options?.length ?? 0) > 1 ? 's' : ''}${event.address ? ` · ${event.address}` : ''}. Vote pour la date qui te convient !`
        : undefined,
  });

  const fetchEvent = async () => {
    try { setEvent(await apiRequest(`/events/${id}`)); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const toggleOption = (optId: string, e: React.MouseEvent) => {
    const isSelecting = !selectedOptions.includes(optId);
    setSelectedOptions(prev => prev.includes(optId) ? prev.filter(i => i !== optId) : [...prev, optId]);
    if (isSelecting) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#2563eb', '#1a3353', '#93c5fd', '#ffffff', '#dce8f8'],
        shapes: ['square', 'circle'],
        scalar: 0.9,
        ticks: 120,
      });
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName) return;
    try {
      await apiRequest(`/events/${id}/votes`, { method: 'POST', body: JSON.stringify({ voter_name: voterName, option_ids: selectedOptions }) });
      setVoted(true); setVoterName(''); setSelectedOptions([]); fetchEvent();
      setTimeout(() => setVoted(false), 3000);
    } catch (err: any) { setError(err.message); }
  };

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-papier"><Navbar />
      <div className="flex items-center justify-center py-32 handwriting text-2xl text-crayon">Chargement…</div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-papier"><Navbar />
      <div className="max-w-md mx-auto py-32 px-6 text-center">
        <p className="handwriting text-4xl text-rouge mb-3">Introuvable 🤔</p>
        <p className="text-crayon mb-6">Cet événement n'existe pas ou a été supprimé.</p>
        <Link to="/"><Button variant="secondary">Retour à l'accueil</Button></Link>
      </div>
    </div>
  );

  const mapsUrl = event.address?.startsWith('http') ? event.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || '')}`;
  const options = [...event.options].sort((a, b) => new Date(`${a.date}T${a.start_time}`).getTime() - new Date(`${b.date}T${b.start_time}`).getTime());
  const allVoters = Array.from(new Set(options.flatMap(o => o.votes)));
  const maxVotes = Math.max(...options.map(o => o.votes.length), 0);

  return (
    <div className="min-h-screen bg-papier pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="handwriting text-5xl md:text-6xl text-encre leading-tight mb-3">{event.title}</h1>
              {event.description && (
                <div className="text-crayon leading-relaxed mb-3 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-encre [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-2 [&_li]:mb-0.5 [&_a]:text-rouge [&_a]:underline [&_h1]:handwriting [&_h2]:handwriting [&_code]:bg-papier-fonce [&_code]:px-1 [&_code]:text-sm [&_code]:font-mono">
                  <Markdown>{event.description}</Markdown>
                </div>
              )}
              {event.address && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-rouge hover:underline">
                  <MapPin size={14} /> {event.address}
                </a>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={copyLink} className="handwriting text-lg text-crayon border-2 border-trait px-4 py-2 hover:border-encre hover:text-encre transition-colors flex items-center gap-2">
                <Share2 size={14} /> {copied ? 'Copié ✓' : 'Partager'}
              </button>
              <Link to={`/event/${id}/admin`}>
                <button className="handwriting text-lg text-crayon border-2 border-trait px-4 py-2 hover:border-encre hover:text-encre transition-colors flex items-center gap-2">
                  <Settings size={14} /> Admin
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-trait overflow-x-auto mb-4">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-trait">
                <th className="p-4 text-left sticky left-0 bg-white z-10 border-r border-trait w-40">
                  <span className="handwriting text-lg text-crayon">{allVoters.length} participant{allVoters.length > 1 ? 's' : ''}</span>
                </th>
                {options.map(opt => {
                  const isBest = opt.votes.length === maxVotes && maxVotes > 0;
                  return (
                    <th key={opt.id} className={`p-4 text-center border-l border-trait min-w-[110px] ${isBest ? 'bg-papier-fonce' : ''}`}>
                      {isBest && <div className="handwriting text-rouge text-lg mb-0.5">⭐ top</div>}
                      <div className="text-xs uppercase tracking-wide text-crayon">
                        {format(new Date(opt.date), 'EEE d MMM', { locale: fr })}
                      </div>
                      <div className="handwriting text-2xl text-encre mt-0.5">{opt.start_time || '—'}</div>
                      <div className={`handwriting text-lg mt-1 ${isBest ? 'text-rouge font-bold' : 'text-crayon'}`}>
                        {opt.votes.length} vote{opt.votes.length > 1 ? 's' : ''}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {allVoters.map((voter, vi) => (
                <tr key={voter} className={`border-b border-trait ${vi % 2 === 1 ? 'bg-papier/70' : ''}`}>
                  <td className="p-4 handwriting text-lg text-encre sticky left-0 bg-white z-10 border-r border-trait">{voter}</td>
                  {options.map(opt => (
                    <td key={opt.id} className="p-4 text-center border-l border-trait">
                      {opt.votes.includes(voter)
                        ? <Check size={20} className="text-rouge mx-auto" strokeWidth={3} />
                        : <span className="text-trait">·</span>}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Vote row */}
              <tr className="border-t border-trait bg-papier">
                <td className="p-3 sticky left-0 bg-papier z-10 border-r border-trait">
                  <input
                    className="w-full bg-white border-2 border-trait px-3 py-2 text-encre text-sm placeholder-crayon focus:outline-none focus:border-encre transition-colors"
                    placeholder="Ton prénom…"
                    value={voterName}
                    onChange={e => setVoterName(e.target.value)}
                  />
                </td>
                {options.map(opt => (
                  <td key={opt.id} className="p-3 text-center border-l border-trait">
                    <button
                      type="button"
                      onClick={e => toggleOption(opt.id, e)}
                      className={`w-9 h-9 border-2 flex items-center justify-center mx-auto transition-all ${
                        selectedOptions.includes(opt.id)
                          ? 'border-rouge bg-rouge text-white'
                          : 'border-trait text-transparent hover:border-encre'
                      }`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="handwriting text-lg text-crayon">
            {voted
              ? <span className="text-rouge">✓ C'est noté !</span>
              : voterName ? <>Je vote en tant que <strong className="text-encre">"{voterName}"</strong></> : 'Entre ton prénom pour voter'}
          </p>
          <Button onClick={handleVote} disabled={!voterName || selectedOptions.length === 0}>
            Voter →
          </Button>
        </div>

        {error && <p className="mt-4 text-sm text-rouge">{error}</p>}
      </main>
    </div>
  );
};
