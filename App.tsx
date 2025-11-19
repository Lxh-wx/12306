
import React, { useEffect, useState, useMemo } from 'react';
import GlobeViz from './components/GlobeViz';
import InfoPanel from './components/InfoPanel';
import RankingPanel from './components/RankingPanel';
import ComparisonPanel from './components/ComparisonPanel';
import LanguageSplash from './components/LanguageSplash';
import SettingsModal from './components/SettingsModal';
import { GDPDataPoint, Language } from './types';
import { TRANSLATIONS, COUNTRY_TRANSLATIONS } from './constants';
import { fetchDynamicGDPData } from './services/geminiService';
import { Globe as GlobeIcon, Loader2, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<GDPDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<GDPDataPoint | null>(null);
  
  // Comparison State
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonPreselect, setComparisonPreselect] = useState<GDPDataPoint | null>(null);

  // Language & Settings State
  const [language, setLanguage] = useState<Language>('en');
  const [showLanguageSplash, setShowLanguageSplash] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const initData = async () => {
      // Fetch data from Gemini or Fallback
      const gdpData = await fetchDynamicGDPData();
      setData(gdpData);
      setLoading(false);
    };
    initData();
  }, []);

  // Translate Data Names
  const localizedData = useMemo(() => {
    return data.map(item => {
      const translatedName = COUNTRY_TRANSLATIONS[item.code]?.[language];
      return {
        ...item,
        country: translatedName || item.country // Fallback to original name if translation missing
      };
    });
  }, [data, language]);

  // Sync selectedCountry when language changes
  useEffect(() => {
    if (selectedCountry) {
      const updatedSelected = localizedData.find(d => d.code === selectedCountry.code);
      if (updatedSelected) {
        setSelectedCountry(updatedSelected);
      }
    }
    if (comparisonPreselect) {
       const updatedPreselect = localizedData.find(d => d.code === comparisonPreselect.code);
       if (updatedPreselect) {
         setComparisonPreselect(updatedPreselect);
       }
    }
  }, [localizedData]); // Trigger when data/language changes

  const handleOpenComparison = (country?: GDPDataPoint) => {
    if (country) setComparisonPreselect(country);
    setIsComparisonOpen(true);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageSplash(false);
  };

  if (showLanguageSplash) {
    return <LanguageSplash onSelect={handleLanguageSelect} />;
  }

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
           {/* Settings Button */}
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2.5 bg-black/40 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full transition-all text-white/70 hover:text-white hover:scale-105 group"
             title={t.settings}
           >
             <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
           </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg backdrop-blur-md border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <GlobeIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-white/60 tracking-[0.2em] uppercase font-semibold">
                {t.poweredBy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/90 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="relative w-12 h-12 animate-spin text-blue-400 mb-4" />
          </div>
          <p className="text-blue-100/80 font-mono text-sm tracking-widest">INITIALIZING PLANETARY DATA...</p>
        </div>
      )}

      {/* Main Globe Visualization */}
      {!loading && (
        <GlobeViz 
          data={localizedData} 
          onCountrySelect={setSelectedCountry}
          selectedCountry={selectedCountry}
          language={language}
        />
      )}

      {/* Left Panel: Ranking List (Only visible when not loading) */}
      {!loading && (
        <RankingPanel 
          data={localizedData}
          selectedCountry={selectedCountry}
          onSelect={setSelectedCountry}
          onCompare={() => handleOpenComparison(selectedCountry || undefined)}
          language={language}
        />
      )}

      {/* Right Panel: Info Details */}
      <div className={`absolute inset-y-0 right-0 z-30 transition-transform duration-500 ease-out ${selectedCountry ? 'translate-x-0' : 'translate-x-full'}`}>
        <InfoPanel 
          country={selectedCountry} 
          onClose={() => setSelectedCountry(null)} 
          onCompare={() => handleOpenComparison(selectedCountry || undefined)}
          language={language}
        />
      </div>

      {/* Comparison Overlay */}
      <ComparisonPanel 
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        data={localizedData}
        initialCountryA={comparisonPreselect}
        language={language}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Data Source Footer */}
      <div className="absolute bottom-4 right-6 z-10 pointer-events-none text-right">
         <p className="text-[10px] text-white/20 uppercase tracking-wider">
           Visual representation of GDP Magnitude (Height/Color)
         </p>
      </div>
    </div>
  );
};

export default App;
