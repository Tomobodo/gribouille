import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="handwriting block text-lg text-encre mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-papier border-2 ${error ? 'border-rouge' : 'border-trait'} px-3 py-2.5 text-encre text-sm placeholder-crayon focus:outline-none focus:border-encre transition-colors ${className}`}
        {...props}
      />
      {error && <p className="handwriting mt-1 text-base text-rouge">↳ {error}</p>}
    </div>
  );
};
