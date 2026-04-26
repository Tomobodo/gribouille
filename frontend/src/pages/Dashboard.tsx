import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Button } from '../components/ui/Button';
import { CalendarCheck, Link2, ThumbsUp } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="handwriting text-6xl md:text-7xl text-encre leading-tight mb-6">
                Trouve la date qui convient<br />
                <span className="text-rouge underline decoration-wavy decoration-rouge/40">à tout le monde.</span>
              </h1>
              <p className="text-gris-500 text-base leading-relaxed mb-8 text-crayon">
                Sans compte, sans pub, sans prise de tête. Tu proposes des dates, tes amis votent, la meilleure s'impose.
              </p>
              <Button onClick={() => navigate('/create')} className="text-xl px-8 py-3">
                Créer un sondage →
              </Button>
            </div>

            {/* Doodle illustration */}
            <div className="hidden md:block">
              <svg viewBox="0 0 400 340" className="w-full max-w-md mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar sketch */}
                <rect x="60" y="40" width="280" height="260" rx="4" stroke="#1a3353" strokeWidth="3" fill="white"/>
                <rect x="60" y="40" width="280" height="55" rx="4" stroke="#1a3353" strokeWidth="3" fill="#1a3353"/>
                {/* Calendar header text */}
                <text x="200" y="76" textAnchor="middle" fill="#fef9f0" fontSize="18" fontFamily="Caveat, cursive" fontWeight="700">Quand on se voit ?</text>
                {/* Grid lines */}
                {[0,1,2,3,4,5,6].map(i => (
                  <line key={`v${i}`} x1={60 + i * 40} y1="95" x2={60 + i * 40} y2="300" stroke="#d6cfc4" strokeWidth="1"/>
                ))}
                {[0,1,2,3,4].map(i => (
                  <line key={`h${i}`} x1="60" y1={95 + i * 41} x2="340" y2={95 + i * 41} stroke="#d6cfc4" strokeWidth="1"/>
                ))}
                {/* Check marks */}
                <circle cx="140" cy="136" r="14" fill="#dc2626" opacity="0.9"/>
                <text x="140" y="141" textAnchor="middle" fill="white" fontSize="14" fontFamily="Caveat, cursive">✓</text>
                <circle cx="180" cy="136" r="14" fill="#dc2626" opacity="0.9"/>
                <text x="180" y="141" textAnchor="middle" fill="white" fontSize="14" fontFamily="Caveat, cursive">✓</text>
                <circle cx="260" cy="177" r="14" fill="#dc2626" opacity="0.9"/>
                <text x="260" y="182" textAnchor="middle" fill="white" fontSize="14" fontFamily="Caveat, cursive">✓</text>
                <circle cx="140" cy="177" r="14" fill="#dc2626" opacity="0.9"/>
                <text x="140" y="182" textAnchor="middle" fill="white" fontSize="14" fontFamily="Caveat, cursive">✓</text>
                {/* Doodle arrow */}
                <path d="M 350 180 C 370 160, 380 200, 360 210" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M 355 205 L 360 210 L 363 202" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Stars */}
                <text x="35" y="120" fill="#dc2626" fontSize="20" fontFamily="Caveat, cursive">✦</text>
                <text x="355" y="80" fill="#1a3353" fontSize="14" fontFamily="Caveat, cursive">✦</text>
                <text x="20" y="240" fill="#d6cfc4" fontSize="16" fontFamily="Caveat, cursive">✦</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="pb-20">
          <h2 className="handwriting text-4xl text-encre mb-8 text-center">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: CalendarCheck, n: '1', title: 'Tu proposes des dates', body: 'Quelques créneaux, un titre, une adresse. Ça prend 30 secondes.' },
              { icon: Link2,         n: '2', title: 'Tu partages le lien',   body: 'Un lien unique à envoyer au groupe. Pas besoin de créer un compte.' },
              { icon: ThumbsUp,      n: '3', title: 'Tout le monde vote',    body: 'Chacun coche ses dispo. La meilleure date saute aux yeux.' },
            ].map(({ icon: Icon, n, title, body }) => (
              <div key={n} className="bg-white border border-trait p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="handwriting text-5xl text-rouge leading-none">{n}.</span>
                  <Icon size={26} className="text-encre flex-shrink-0" strokeWidth={1.5} />
                </div>
                <h3 className="handwriting text-2xl text-encre mb-2">{title}</h3>
                <p className="text-crayon text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};
