
import React, { useState, useMemo } from 'react';
import { GDPDataPoint, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, Trophy, TrendingUp, TrendingDown, PanelLeftClose, ArrowRightLeft } from 'lucide-react';

interface RankingPanelProps {
  data: GDPDataPoint[];
  selectedCountry: GDPDataPoint | null;
  onSelect: (country: GDPDataPoint) => void;
  onCompare: () => void;
  language: Language;
}

const RankingPanel: React.FC<RankingPanelProps> = ({ data, selectedCountry, onSelect, onCompare, language }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const t = TRANSLATIONS[language];

  const filteredData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.rank - b.rank);
    return sorted.filter(d => 
      d.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-24 left-6 w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-white hover:bg-white/10 transition-all z-20 group"
        aria-label="Open Rankings"
        title={t.rankingsTitle}
      >
        <Trophy className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="absolute top-24 left-6 w-80 max-h-[calc(100vh-8rem)] flex flex-col bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-white overflow-hidden transition-all duration-300 z-20 pointer-events-auto animate-in slide-in-from-left-4 fade-in duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-lg tracking-tight">{t.rankingsTitle}</h2>
          </div>
          <div className="flex items-center gap-1">
             <button 
                onClick={onCompare}
                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                title={t.compareTitle}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                aria-label="Collapse Panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <button
              key={item.code}
              onClick={() => onSelect(item)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group border ${
                selectedCountry?.code === item.code 
                  ? 'bg-blue-600/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'hover:bg-white/5 border-transparent hover:border-white/5'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-mono text-xs font-bold ${
                 item.rank <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'
              }`}>
                {item.rank}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium truncate text-sm text-white/90 group-hover:text-white">
                  {item.country}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>${item.gdp.toLocaleString()} B</span>
                </div>
              </div>

              <div className={`text-xs font-medium flex items-center ${item.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.growthRate}%
                {item.growthRate >= 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center text-white/30 text-sm">
            {t.noCountriesFound}
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="p-3 bg-white/5 border-t border-white/10 text-[10px] text-center text-white/40 uppercase tracking-widest">
        {data.length} {t.economiesTracked}
      </div>
    </div>
  );
};

export default RankingPanel;
