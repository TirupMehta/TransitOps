import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBg, progress }) => {
  return (
    <div className="rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200 group neumorph-outset border border-theme">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-secondary tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 duration-200 shadow-inner border border-theme bg-app-theme/50 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-extrabold text-primary mb-1">{value}</div>
      <p className="text-xs text-secondary/80 font-semibold tracking-wide">{subtitle}</p>
      
      {progress !== undefined && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3.5 neumorph-inset">
          <div 
            className="bg-orange h-full rounded-full transition-all duration-500 shadow-xs" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
