'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
}

export const Card: React.FC<CardProps> = ({ 
  variant = 'default',
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200';
  const variantStyles = {
    default: 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm',
    glass: 'glass-effect',
    gradient: 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50 backdrop-blur-sm'
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};