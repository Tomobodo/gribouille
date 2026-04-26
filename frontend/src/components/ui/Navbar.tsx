import React from 'react';
import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-papier border-b border-trait">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <PenLine size={22} className="text-rouge" strokeWidth={2.5} />
          <span className="handwriting text-3xl text-encre leading-none">Gribouille</span>
        </Link>
        <Link to="/create">
          <span className="handwriting text-lg text-papier bg-rouge px-4 py-1.5 hover:bg-rouge/80 transition-colors duration-150 cursor-pointer inline-block select-none">
            + Nouveau sondage
          </span>
        </Link>
      </div>
    </nav>
  );
};
