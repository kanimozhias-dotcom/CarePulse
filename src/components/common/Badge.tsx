import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'teal' 
    | 'blue' 
    | 'emerald' 
    | 'amber' 
    | 'rose' 
    | 'purple' 
    | 'slate' 
    | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200/70',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/70',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/70',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200/70',
  };

  const dotColors = {
    teal: 'bg-teal-500',
    blue: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500',
    neutral: 'bg-gray-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'completed':
    case 'reviewed':
    case 'approved':
      return 'emerald';
    case 'scheduled':
    case 'pending':
    case 'waiting':
      return 'blue';
    case 'in-consultation':
    case 'called':
      return 'teal';
    case 'cancelled':
    case 'rejected':
    case 'no-show':
      return 'rose';
    case 'delayed':
    case 'critical':
      return 'amber';
    case 'teleconsult':
      return 'purple';
    default:
      return 'slate';
  }
}
