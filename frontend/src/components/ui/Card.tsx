import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border border-trait ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-trait">
          <h2 className="handwriting text-2xl text-encre">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
