import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', fullWidth = false, className = '', ...props
}) => {
  const base = 'handwriting inline-flex items-center justify-center gap-2 px-5 py-2 text-lg transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-rouge border border-encre/60';

  const variants = {
    primary:   'bg-rouge text-papier border-rouge hover:bg-rouge/80 hover:border-rouge/80',
    secondary: 'bg-transparent text-encre hover:bg-papier-fonce',
    danger:    'bg-transparent border-rouge text-rouge hover:bg-rouge hover:text-papier',
    ghost:     'border-transparent text-crayon hover:text-encre',
  };

  return (
    <button className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
};
