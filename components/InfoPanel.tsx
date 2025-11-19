
import React, { useEffect, useState } from 'react';
import { GDPDataPoint, AIAnalysis, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { analyzeCountryEconomy } from '../services/geminiService';
import TrendChart from './TrendChart';
import { ArrowRight, BarChart3, TrendingUp, BrainCircuit, X, Loader2, ArrowRightLeft, Calendar } from 'lucide-react';

interface InfoPanelProps {
  country: GDPDataPoint | null;
  onClose: () => void;
  onCompare: () => void;
  language: Language;
  year: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ country, onClose, onCompare, language, year }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (country) {
      setLoading(true);
      setAnalysis(null);
      analyzeCountryEconomy(country.country, country.gdp, language, year)
        .then(data => setAnalysis(data))
        .catch(() => setAnalysis(null))
        .finally(() => setLoading(false));
    }
  }, [country, language, year]); // Re-run when year changes

  if (!country) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl text-white p-6 overflow-y-auto transition-all duration-300 z-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            {country.country}
          </h2>
          <div className="flex items-center gap-2 text-white/60 mt-1">
            <span className="text-sm font-mono">{country.code}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span className="text-sm">{t.globalRank} #{country.rank}</span>
             <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <span className="text-sm flex items-center gap-1 text-blue-300"><Calendar className="w-3 h-3"/> {year}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCompare}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
            title={t.compareTitle}
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4" /> {t.gdpNominal}
          </div>
          <div className="text-2xl font-semibold text-emerald-300">
            ${country.gdp.toLocaleString()} B
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4" /> {t.growthRate}
          </div>
          <div className={`text-2xl font-semibold ${country.growthRate >= 0 ? 'text-blue-300' : 'text-red-300'}`}>
            {country.growthRate > 0 ? '+' : ''}{country.growthRate}%
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="mb-8">
        <TrendChart 
          countryCode={country.code}
          currentYear={year}
          currentGdp={country.gdp}
          growthRate={country.growthRate}
        />
      </div>

      {/* AI Analysis Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">{t.aiInsights}</h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">{t.analyzing}</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-5 rounded-xl border border-white/10">
              <p className="text-white/90 leading-relaxed text-sm">
                {analysis.summary}
              </p>
            </div>

            {/* Key Sectors */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3">{t.keySectors}</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keySectors.map((sector, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-white/10 rounded-md text-xs font-medium text-blue-200 border border-white/5 hover:bg-white/20 transition-colors cursor-default"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            {/* Outlook */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/50 mb-3">{t.outlook} ({year + 1})</h4>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border-l-2 border-yellow-500">
                 <ArrowRight className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                 <p className="text-sm text-white/80">{analysis.outlook}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-white/40 text-sm">
            {t.analysisUnavailable}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
