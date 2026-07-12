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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl border border-slate-100/50 ${iconBg} transition-transform group-hover:scale-105 duration-200`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 mb-1">{value}</div>
      <p className="text-[11px] text-slate-400 font-semibold uppercase">{subtitle}</p>
      
      {progress !== undefined && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
          <div 
            className="bg-indigo-655 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
