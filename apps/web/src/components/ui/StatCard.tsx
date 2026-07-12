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
    <div className="rounded-2xl p-5 hover:scale-[1.01] transition-all duration-200 group neumorph-outset border border-white/50">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-extrabold text-[#87786f] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 duration-200 shadow-[inset_2px_2px_4px_#e0d4bc,inset_-2px_-2px_4px_#ffffff] border border-white/20 bg-[#faf5e9] ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-[#2e2520] mb-1">{value}</div>
      <p className="text-[10px] text-[#87786f] font-bold uppercase tracking-wider">{subtitle}</p>
      
      {progress !== undefined && (
        <div className="w-full bg-[#f2efe7] rounded-full h-2 mt-3.5 shadow-[inset_1px_1px_3px_#e0d4bc,inset_-1px_-1px_3px_#ffffff]">
          <div 
            className="bg-[#b84a14] h-2 rounded-full transition-all duration-500 shadow-xs" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
