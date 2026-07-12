import React from 'react';

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success': return 'bg-[#f0f4e4] text-[#4f6128] border-[#d8e2bd]';
      case 'warning': return 'bg-[#fbf2e6] text-[#8a4f10] border-[#f0dcb8]';
      case 'danger': return 'bg-[#f9ebe6] text-[#8c2510] border-[#eccbc1]';
      case 'info': return 'bg-[#eaf3f5] text-[#2b5058] border-[#cbe0e5]';
      case 'neutral': return 'bg-[#f2efe7] text-[#5a5246] border-[#dfdbcf]';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStyles()}`}>
      {children}
    </span>
  );
};
