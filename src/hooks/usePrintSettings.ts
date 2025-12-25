import { useState, useEffect } from 'react';

const STORAGE_KEY = 'print_settings';

export interface PrintSettings {
  useDotMatrix: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
  useDotMatrix: false,
};

export const usePrintSettings = () => {
  const [settings, setSettings] = useState<PrintSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading print settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving print settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<PrintSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleDotMatrix = () => {
    setSettings(prev => ({ ...prev, useDotMatrix: !prev.useDotMatrix }));
  };

  return {
    settings,
    updateSettings,
    toggleDotMatrix,
  };
};
