import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="handwriting block text-lg text-encre mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-papier border-2 ${error ? 'border-rouge' : 'border-trait'} px-3 py-2.5 text-encre text-sm placeholder-crayon focus:outline-none focus:border-encre transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <p className="handwriting mt-1 text-base text-rouge">↳ {error}</p>}
    </div>
  );
};
