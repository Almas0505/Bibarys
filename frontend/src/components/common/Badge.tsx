import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
