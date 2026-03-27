import { useState, useEffect } from 'react';

export const useSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('c7_settings');
    return saved ? JSON.parse(saved) : { colorAcentoHex: '#e91e63', voz: 'Ember' };
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('c7_settings');
      if (saved) setSettings(JSON.parse(saved));
    };
    window.addEventListener('settingsUpdated', handleStorage);
    // Listen to vanilla storage events for cross-tab sync
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('settingsUpdated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return settings;
};
