import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const ThemeLanguageContext = createContext();

export const ThemeLanguageProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('sam-theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('sam-lang') || 'en');

  // Sync theme to root classList
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sam-theme', theme);
  }, [theme]);

  // Sync language to local storage
  useEffect(() => {
    localStorage.setItem('sam-lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Translation helper function
  const t = (key) => {
    const langSet = translations[language] || translations['en'];
    return langSet[key] || translations['en'][key] || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, changeLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
