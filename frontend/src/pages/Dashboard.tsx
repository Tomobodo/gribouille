import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Organise tes sorties en 2 secondes.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pas de compte, pas de pub, et surtout pas d'abonnement éclaté. Juste toi, tes potes et des bonnes dates.
          </p>
        </div>

        <Card title="Bienvenue sur l'alternative libre">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Doodle est devenu trop complexe et cher ? Tu es au bon endroit. Ici, on va droit au but.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">1. Crée</h3>
                <p className="text-sm text-blue-700">Choisis tes dates et tes horaires sans limite.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-bold text-green-800 mb-2">2. Partage</h3>
                <p className="text-sm text-green-700">Envoie l'URL unique à ton groupe.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-bold text-purple-800 mb-2">3. Votez</h3>
                <p className="text-sm text-purple-700">Tout le monde vote en un clic.</p>
              </div>
            </div>
            <div className="pt-8 flex justify-center">
              <Button onClick={() => navigate('/create')} className="text-lg px-8 py-3">
                Lancer un sondage maintenant
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
