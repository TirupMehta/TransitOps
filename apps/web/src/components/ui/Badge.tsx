import React from 'react';

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100/80';
      case 'danger': return 'bg-rose-50 text-rose-700 border-rose-100/80';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-100/80';
      case 'neutral': return 'bg-slate-100 text-slate-650 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStyles()}`}>
      {children}
    </span>
  );
};
