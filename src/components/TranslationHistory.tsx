import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Volume2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export interface HistoryItem {
  id: string;
  inputText: string;
  outputText: string;
  fromLang: string;
  toLang: string;
  timestamp: Date;
}

interface TranslationHistoryProps {
  history: HistoryItem[];
  onSpeak?: (text: string, lang: string) => void | Promise<void>;
  onReuse: (item: HistoryItem) => void;
  onClear: () => void;
}

export const TranslationHistory: React.FC<TranslationHistoryProps> = ({
  history,
  onSpeak,
  onReuse,
  onClear
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLanguageName = (code: string) => {
    return code === 'en' ? 'English' : 'Spanish';
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Translation History</h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          Your translation history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Translation History</h3>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {history.slice().reverse().map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onReuse(item)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-gray-500">
                  {getLanguageName(item.fromLang)} → {getLanguageName(item.toLang)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(item.timestamp)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-900 flex-1 mr-2">
                    {item.inputText}
                  </p>
                  <div className="flex gap-1">
                    {onSpeak && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeak(item.inputText, item.fromLang);
                        }}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.inputText, `${item.id}-input`);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy"
                    >
                      {copiedId === `${item.id}-input` ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-l-2 border-primary-200 pl-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-primary-700 flex-1 mr-2">
                      {item.outputText}
                    </p>
                    <div className="flex gap-1">
                      {onSpeak && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSpeak(item.outputText, item.toLang);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Listen"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(item.outputText, `${item.id}-output`);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy"
                      >
                        {copiedId === `${item.id}-output` ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};