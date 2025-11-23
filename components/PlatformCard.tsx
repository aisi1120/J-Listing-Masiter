import React from 'react';
import { Platform } from '../types';
import { PLATFORM_CONFIG } from '../constants';

interface PlatformCardProps {
  platform: Platform;
  selected: boolean;
  onClick: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, selected, onClick }) => {
  const config = PLATFORM_CONFIG[platform];
  
  return (
    <button
      onClick={onClick}
      className={`relative p-8 rounded-3xl border transition-all duration-300 w-full text-left group
        ${selected 
          ? `border-${config.color.replace('bg-', '')} shadow-xl shadow-rose-100 scale-[1.02] bg-white ring-4 ring-rose-50` 
          : 'border-transparent bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-rose-100/50 hover:-translate-y-1'
        }
      `}
    >
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md transition-colors
        ${selected ? config.color : 'bg-slate-300 group-hover:bg-slate-400'}
      `}>
        {config.icon}
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-3">{platform}</h3>
      
      <ul className="text-sm text-slate-500 space-y-2">
        {config.rules.slice(0, 3).map((rule, idx) => (
          <li key={idx} className="flex items-start">
            <span className="mr-2 text-rose-300 mt-1">•</span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="absolute top-6 right-6">
          <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center shadow-lg animate-bounce`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default PlatformCard;