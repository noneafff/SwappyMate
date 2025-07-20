// File: context/ThemeContext.js

import React, { createContext, useState, useContext } from 'react';
import { themes } from '../constants/colors';

// --- THIS IS THE KEY CHANGE ---
// We provide a default value to createContext.
// This ensures that if a component accidentally renders outside the provider,
// the app won't crash when it calls useTheme(). It will get this default object.
const defaultValue = {
  theme: 'light',
  setTheme: () => {}, // A placeholder function
  colors: themes.light, // Default to the light theme colors
};

const ThemeContext = createContext(defaultValue);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const colors = themes[theme];
  const value = { theme, setTheme, colors };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// The custom hook remains the same
export const useTheme = () => useContext(ThemeContext);