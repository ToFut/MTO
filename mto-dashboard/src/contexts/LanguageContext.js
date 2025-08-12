import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'cn', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'vn', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'kh', name: 'Khmer', flag: '🇰🇭', nativeName: 'ភាសាខ្មែរ' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (languageCode) => {
    try {
      const translationModule = await import(`../translations/${languageCode}.js`);
      setTranslations(translationModule.default);
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}, falling back to English`);
      if (languageCode !== 'en') {
        const fallbackModule = await import('../translations/en.js');
        setTranslations(fallbackModule.default);
      }
    }
  };

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const t = (key, defaultValue = key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getCurrentLanguageInfo: () => SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};