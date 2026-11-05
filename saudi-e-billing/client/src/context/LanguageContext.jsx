import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return loadFromStorage('saudi_ebilling_lang', 'en');
  });

  const isArabic = language === 'ar';

  useEffect(() => {
    saveToStorage('saudi_ebilling_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.title = isArabic
      ? 'الفوترة الإلكترونية السعودية | نظام الفوترة التجارية للمنشآت'
      : 'Saudi E-Billing | Enterprise Commercial Invoicing';

    if (isArabic) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language, isArabic]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ar') {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English
    return translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

