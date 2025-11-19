
import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSplashProps {
  onSelect: (lang: Language) => void;
}

const LanguageSplash: React.FC<LanguageSplashProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
        <Globe className="relative w-20 h-20 text-blue-400" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center tracking-tight">
        Global Economy 3D
      </h1>
      <p className="text-white/40 text-sm uppercase tracking-widest mb-12">Select Your Language</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => onSelect('en')}
          className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-left"
        >
          <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">English</div>
          <div className="text-xs text-white/40">International</div>
        </button>

        <button
          onClick={() => onSelect('zh')}
          className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-left"
        >
          <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">中文 (简体)</div>
          <div className="text-xs text-white/40">Chinese Simplified</div>
        </button>

        <button
          onClick={() => onSelect('fr')}
          className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-left"
        >
          <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Français</div>
          <div className="text-xs text-white/40">French</div>
        </button>

        <button
          onClick={() => onSelect('ja')}
          className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] text-left"
        >
          <div className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">日本語</div>
          <div className="text-xs text-white/40">Japanese</div>
        </button>
      </div>
      
      <div className="mt-12 text-white/20 text-xs">
        Powered by Google Gemini
      </div>
    </div>
  );
};

export default LanguageSplash;
