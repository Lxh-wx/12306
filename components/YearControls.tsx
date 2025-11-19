
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Check, Lock } from 'lucide-react';

interface YearControlsProps {
  year: number;
  onChange: (year: number) => void;
  language: Language;
}

const MIN_YEAR = 2015; // Start from earlier years
const MAX_YEAR = 2030;
const LOCKED_YEAR_START = 2026; // 2026+ is grayed out/locked

const YearControls: React.FC<YearControlsProps> = ({ year, onChange, language }) => {
  const t = TRANSLATIONS[language];
  // localYear tracks the "scroll" state before user confirms
  const [localYear, setLocalYear] = useState(year);

  useEffect(() => {
    setLocalYear(year);
  }, [year]);

  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.deltaY < 0) {
      setLocalYear(prev => Math.min(MAX_YEAR, prev + 1));
    } else {
      setLocalYear(prev => Math.max(MIN_YEAR, prev - 1));
    }
  };

  const handleConfirm = () => {
    onChange(localYear);
  };

  // Check if the locally selected year is in the locked range
  const isLocked = localYear >= LOCKED_YEAR_START;

  return (
    <div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500"
    >
      <div className="relative">
        {/* Glass container mimicking a cylinder picker */}
        <div 
          className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-2 shadow-2xl flex flex-col items-center gap-1 transition-all w-32 h-40 overflow-hidden relative group hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] cursor-ns-resize"
          onWheel={handleWheel}
        >
          {/* Selection Highlight Line */}
          <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white/5 border-y border-white/10 pointer-events-none z-0"></div>

          {/* Gradient Masks for 3D effect */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>

          {/* Scroll List */}
          <div className="flex flex-col items-center justify-center h-full z-0 transition-all duration-300 ease-out">
            {years.map((y) => {
              const dist = y - localYear;
              const isVisible = Math.abs(dist) <= 2;
              
              if (!isVisible) return null;

              let styleClass = "text-white/20 text-sm scale-75 font-medium";
              
              // Styling based on distance
              if (dist === 0) {
                // Current selection
                if (y >= LOCKED_YEAR_START) {
                   styleClass = "text-white/30 text-2xl font-bold scale-110 my-1 line-through decoration-white/20"; // Locked style
                } else {
                   styleClass = "text-white text-2xl font-bold scale-110 my-1";
                }
              }
              
              if (Math.abs(dist) === 1) styleClass = "text-white/50 text-lg font-semibold my-0.5";

              return (
                <div 
                  key={y} 
                  className={`transition-all duration-200 ${styleClass} tabular-nums font-mono cursor-pointer select-none flex items-center gap-2`}
                  onClick={() => setLocalYear(y)}
                >
                  {y}
                  {y >= LOCKED_YEAR_START && dist === 0 && <Lock className="w-3 h-3 text-white/30" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm Button Bubble - Only shows if changed AND not locked */}
        {localYear !== year && !isLocked && (
          <button
            onClick={handleConfirm}
            className="absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-lg flex items-center justify-center animate-in zoom-in duration-200 hover:scale-110 transition-all z-30"
            title={t.confirmChange}
          >
            <Check className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Label */}
      <div className="mt-3 text-[10px] text-white/40 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
         {isLocked ? 'Locked' : localYear === 2024 ? 'Present' : localYear > 2024 ? t.projections : t.historical}
      </div>
    </div>
  );
};

export default YearControls;
