import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'btn';
  const variantStyles = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
