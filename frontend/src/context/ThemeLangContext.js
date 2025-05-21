import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeLangContext = createContext();

const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const defaultLang = 'en';

export const ThemeLangProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || defaultTheme);
  const [lang, setLang] = useState(localStorage.getItem('lang') || defaultLang);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(lang === 'en' ? 'fil' : 'en');

  return (
    <ThemeLangContext.Provider value={{ theme, toggleTheme, lang, toggleLang }}>
      {children}
    </ThemeLangContext.Provider>
  );
};

export const useThemeLang = () => useContext(ThemeLangContext); 