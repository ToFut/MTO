import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle = ({ className = '', compact = false }) => {
  const { currentLanguage, changeLanguage, supportedLanguages, getCurrentLanguageInfo, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangInfo = getCurrentLanguageInfo();

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all duration-200 text-slate-700"
        >
          <span className="text-lg">{currentLangInfo?.flag}</span>
          <span className="text-sm font-medium">{currentLangInfo?.code.toUpperCase()}</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                  currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-slate-500">{lang.name}</div>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <span className="font-medium">{t('language.selectLanguage', 'Language')}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg">
          <span className="text-lg">{currentLangInfo?.flag}</span>
          <span className="font-semibold">{currentLangInfo?.nativeName}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h3 className="text-white font-semibold text-lg">{t('language.selectLanguage', 'Select Language')}</h3>
            <p className="text-white/80 text-sm mt-1">Choose your preferred language</p>
          </div>
          
          <div className="py-2 max-h-64 overflow-y-auto">
            {supportedLanguages.map((lang) => {
              const isCurrentLang = currentLanguage === lang.code;
              const isComingSoon = !['en', 'cn'].includes(lang.code);
              
              return (
                <button
                  key={lang.code}
                  onClick={() => !isComingSoon && handleLanguageSelect(lang.code)}
                  disabled={isComingSoon}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all duration-200 ${
                    isComingSoon 
                      ? 'opacity-50 cursor-not-allowed bg-slate-50' 
                      : isCurrentLang 
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' 
                        : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className={`font-semibold ${isCurrentLang ? 'text-blue-600' : 'text-slate-900'}`}>
                      {lang.nativeName}
                    </div>
                    <div className="text-sm text-slate-500">{lang.name}</div>
                    {isComingSoon && (
                      <div className="text-xs text-amber-600 font-medium mt-1">Coming Soon</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentLang && (
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        <Check className="h-3 w-3" />
                        Current
                      </div>
                    )}
                    {isComingSoon && (
                      <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                        Soon
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              More languages will be added soon. Current: {currentLangInfo?.nativeName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;