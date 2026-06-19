'use client';

import { useEffect } from 'react';
import { useVocabStore } from '@/lib/store';
import { apiClient } from '@/services/api';

export default function AppInitializer() {
  const setSystemSettings = useVocabStore(state => state.setSystemSettings);
  const systemSettings = useVocabStore(state => state.systemSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await (apiClient as any).client.get('/admin/settings');
        const json = res.data;
        if (json.success && json.data) {
          setSystemSettings(json.data);

          // Apply Theme, UI Style, and Font to body
          const primaryColor = json.data.primaryColor || 'indigo';
          const uiStyle = json.data.uiStyle || 'glassmorphism';
          const fontFamily = json.data.fontFamily || 'inter';

          document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .replace(/ui-\w+/g, '')
            .replace(/font-\w+/g, '');

          document.body.classList.add(`theme-${primaryColor}`);
          document.body.classList.add(`ui-${uiStyle}`);
          document.body.classList.add(`font-${fontFamily}`);
        }
      } catch (error) {
        console.error('Failed to load system settings', error);
      }
    }
    loadSettings();
  }, [setSystemSettings]);

  // Optionally set the document title
  useEffect(() => {
    if (systemSettings?.applicationName) {
      document.title = `${systemSettings.applicationName} - AI Vocabulary Learning`;
    }
  }, [systemSettings]);

  return null;
}
