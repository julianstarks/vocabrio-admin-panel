import { useState, useCallback } from 'react';
import type { HistoryItem } from '../components/TranslationHistory';

export const useTranslationHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = useCallback((
    inputText: string,
    outputText: string,
    fromLang: string,
    toLang: string
  ) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      inputText,
      outputText,
      fromLang,
      toLang,
      timestamp: new Date()
    };

    setHistory(prev => {
      // Avoid duplicates
      const isDuplicate = prev.some(item => 
        item.inputText === inputText && 
        item.outputText === outputText &&
        item.fromLang === fromLang &&
        item.toLang === toLang
      );

      if (isDuplicate) return prev;

      // Keep only last 50 items
      const newHistory = [newItem, ...prev].slice(0, 50);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    clearHistory
  };
};