import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Organise tes sorties en 2 secondes.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Pas de compte, pas de pub, et surtout pas d'abonnement éclaté. Juste toi, tes potes et des bonnes dates.
          </p>
        </div>

        <Card title="Bienvenue sur l'alternative libre">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Doodle est devenu trop complexe et cher ? Tu es au bon endroit. Ici, on va droit au but.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-1">1. Crée</h3>
                <p className="text-sm text-blue-700">Dates et horaires sans limite.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-bold text-green-800 mb-1">2. Partage</h3>
                <p className="text-sm text-green-700">URL unique pour ton groupe.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-bold text-purple-800 mb-1">3. Votez</h3>
                <p className="text-sm text-purple-700">Vote en un clic.</p>
              </div>
            </div>
            <div className="pt-6 flex justify-center">
              <Button onClick={() => navigate('/create')} className="w-full md:w-auto text-lg px-8 py-3">
                Lancer un sondage
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
