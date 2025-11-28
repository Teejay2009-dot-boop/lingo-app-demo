import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("speaksmart-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      // Check system preference only if no saved preference
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(systemPrefersDark);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Only apply to DOM after initial load to prevent flash
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("speaksmart-theme", isDark ? "dark" : "light");
    }
  }, [isDark, isLoaded]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark) => {
    setIsDark(dark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};