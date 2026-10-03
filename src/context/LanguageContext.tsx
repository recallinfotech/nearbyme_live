import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../services/storage';
import { LanguageCode, TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageOption, localizeText } from '../i18n/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  localize: (text: string) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  localize: (text: string) => text,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const initLanguage = async () => {
      const saved = await getStorageItem<LanguageCode>('app_language');
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    };
    initLanguage();
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      setStorageItem('app_language', lang);
    }
  };

  const t = (key: any, fallback?: string): string => {
    if (!key || typeof key !== 'string') return fallback || '';
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    if (fallback) return fallback;
    // Format camelCase to readable sentence with spaces if translation key is missing
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const localize = (text: any): string => {
    if (!text || typeof text !== 'string') return (text ?? '').toString();
    return localizeText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
