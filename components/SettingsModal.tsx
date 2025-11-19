
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { X, Globe, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentLanguage, onLanguageChange }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage];

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'zh', label: 'Chinese', native: '中文' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'ja', label: 'Japanese', native: '日本語' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.settings}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider mb-4">
              <Globe className="w-4 h-4" /> {t.selectLanguage}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{lang.native}</span>
                  {currentLanguage === lang.code && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
