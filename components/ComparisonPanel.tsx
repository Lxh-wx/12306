
import React, { useState, useEffect, useMemo } from 'react';
import { GDPDataPoint, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { X, ArrowRightLeft, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

interface ComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: GDPDataPoint[];
  initialCountryA: GDPDataPoint | null;
  language: Language;
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ isOpen, onClose, data, initialCountryA, language }) => {
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');

  const t = TRANSLATIONS[language];

  // Initialize selection when opening or props change
  useEffect(() => {
    if (isOpen) {
      if (initialCountryA) {
        setSelectedIdA(initialCountryA.code);
        // Default comparison: if A is rank 1, pick rank 2, else pick rank 1
        const defaultB = data.find(d => d.rank === (initialCountryA.rank === 1 ? 2 : 1));
        if (defaultB) setSelectedIdB(defaultB.code);
      } else {
        // Default to Top 2 if nothing selected
        const rank1 = data.find(d => d.rank === 1);
        const rank2 = data.find(d => d.rank === 2);
        if (rank1) setSelectedIdA(rank1.code);
        if (rank2) setSelectedIdB(rank2.code);
      }
    }
  }, [isOpen, initialCountryA, data]);

  const countryA = useMemo(() => data.find(d => d.code === selectedIdA), [data, selectedIdA]);
  const countryB = useMemo(() => data.find(d => d.code === selectedIdB), [data, selectedIdB]);

  if (!isOpen) return null;

  const sortedData = [...data].sort((a, b) => a.country.localeCompare(b.country));

  // Helper for simple bar width
  const maxGDP = Math.max(countryA?.gdp || 0, countryB?.gdp || 0);
  const getWidth = (gdp: number) => `${(gdp / maxGDP) * 100}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.compareTitle}</h2>
              <p className="text-xs text-white/40 uppercase tracking-wider">{t.compareSubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
            
            {/* Divider (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

            {/* Country A */}
            <div className="space-y-6">
              <div className="relative">
                 <select 
                   value={selectedIdA}
                   onChange={(e) => setSelectedIdA(e.target.value)}
                   className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                 >
                   {sortedData.map(c => (
                     <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                       {c.country}
                     </option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>
              
              {countryA && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                   <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm text-white/40 uppercase tracking-wider mb-1">{t.globalRank}</div>
                        <div className="text-4xl font-bold text-white">#{countryA.rank}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm text-white/40 uppercase tracking-wider mb-1">{t.gdpNominal}</div>
                         <div className="text-2xl font-mono font-bold text-emerald-400">${countryA.gdp.toLocaleString()} B</div>
                      </div>
                   </div>

                   {/* GDP Bar */}
                   <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: countryB ? getWidth(countryA.gdp) : '100%' }} 
                      />
                   </div>
                   
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/60">{t.growthRate}</span>
                        <span className={`text-lg font-bold flex items-center gap-1 ${countryA.growthRate >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          {countryA.growthRate}%
                          {countryA.growthRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </span>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Country B */}
            <div className="space-y-6">
              <div className="relative">
                 <select 
                   value={selectedIdB}
                   onChange={(e) => setSelectedIdB(e.target.value)}
                   className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                 >
                   {sortedData.map(c => (
                     <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                       {c.country}
                     </option>
                   ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
              </div>

              {countryB && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm text-white/40 uppercase tracking-wider mb-1">{t.globalRank}</div>
                        <div className="text-4xl font-bold text-white">#{countryB.rank}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm text-white/40 uppercase tracking-wider mb-1">{t.gdpNominal}</div>
                         <div className="text-2xl font-mono font-bold text-blue-400">${countryB.gdp.toLocaleString()} B</div>
                      </div>
                   </div>

                   {/* GDP Bar */}
                   <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: countryA ? getWidth(countryB.gdp) : '100%' }} 
                      />
                   </div>

                   <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/60">{t.growthRate}</span>
                        <span className={`text-lg font-bold flex items-center gap-1 ${countryB.growthRate >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          {countryB.growthRate}%
                          {countryB.growthRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Footer */}
          {countryA && countryB && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4 text-center">{t.comparativeInsight}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                 <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-xs text-white/40 mb-1">{t.gdpDifference}</div>
                    <div className="text-white font-medium">
                      {countryA.gdp > countryB.gdp ? countryA.country : countryB.country} is
                      <span className="text-emerald-400 font-bold mx-1">
                        {Math.abs((countryA.gdp - countryB.gdp) / Math.min(countryA.gdp, countryB.gdp)).toFixed(2)}x
                      </span>
                      {t.larger}
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-xs text-white/40 mb-1">{t.growthDelta}</div>
                    <div className="text-white font-medium">
                       {Math.abs(countryA.growthRate - countryB.growthRate).toFixed(1)}% {t.difference}
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-xs text-white/40 mb-1">{t.rankingGap}</div>
                    <div className="text-white font-medium">
                       {Math.abs(countryA.rank - countryB.rank)} {t.positions}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;
