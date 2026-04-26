import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          Gribouille
        </Link>
        <Link to="/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
            Créer un événement
          </button>
        </Link>
      </div>
    </nav>
  );
};
