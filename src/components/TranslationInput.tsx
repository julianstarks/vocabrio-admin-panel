import React, { useState, useCallback, memo } from 'react';
import { Mic, MicOff, Volume2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isListening?: boolean;
  onToggleListening?: () => void;
  onSpeak?: (text: string, lang: string) => void | Promise<void>;
  canSpeak?: boolean;
  isOutput?: boolean;
  language?: string;
}

const TranslationInput: React.FC<TranslationInputProps> = memo(({
  value,
  onChange,
  placeholder,
  isListening = false,
  onToggleListening,
  onSpeak,
  canSpeak = false,
  isOutput = false,
  language = 'en'
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = useCallback(async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  }, [value]);

  const handleMicClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Microphone button clicked');
    if (onToggleListening) {
      onToggleListening();
    }
  }, [onToggleListening]);

  const handleSpeakClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔊 AUDIO DEMO - Speak button clicked, text:', value, 'language:', language);
    
    if (onSpeak && value.trim()) {
      setIsPlaying(true);
      onSpeak(value, language);
      
      // Reset playing state after estimated duration
      const estimatedDuration = Math.max(3000, value.length * 100);
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedDuration);
    }
  }, [onSpeak, value, language]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Determine if audio button should show
  const shouldShowAudioButton = isOutput ? (value && onSpeak) : (canSpeak && value);

  console.log('🔊 AUDIO DEMO - Audio button logic:', {
    isOutput,
    value: !!value,
    onSpeak: !!onSpeak,
    canSpeak,
    shouldShowAudioButton,
    language
  });

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          readOnly={isOutput}
          className={`w-full h-32 p-4 pr-24 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
            isOutput 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-white border-gray-300 hover:border-gray-400'
          }`}
        />
        
        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* Copy button for output */}
          {isOutput && value && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors shadow-sm border border-gray-200"
              title="Copy text"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Audio button - shows for output with text and onSpeak, or for input with canSpeak and text */}
          {shouldShowAudioButton && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeakClick}
              type="button"
              disabled={!value.trim()}
              className={`p-2 text-white rounded-full transition-all duration-200 shadow-lg border-2 ${
                isPlaying
                  ? 'bg-blue-600 border-blue-500 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600 border-blue-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isOutput ? "Click to hear translation" : "Click to hear pronunciation"}
            >
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  <Volume2 className="h-5 w-5" />
                </motion.div>
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </motion.button>
          )}

          {/* Voice input button */}
          {!isOutput && onToggleListening && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
              type="button"
              className={`p-2 rounded-full transition-all duration-200 shadow-lg border-2 ${
                isListening
                  ? 'text-white bg-red-500 hover:bg-red-600 border-red-400 animate-pulse'
                  : 'text-white bg-green-500 hover:bg-green-600 border-green-400'
              }`}
              title={isListening ? 'Click to stop listening' : 'Click to start voice input'}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <MicOff className="h-5 w-5" />
                </motion.div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Button labels */}
      <div className="absolute -bottom-6 right-3 flex gap-2 text-xs">
        {shouldShowAudioButton && (
          <span className={`px-2 py-1 rounded font-medium ${
            isPlaying 
              ? 'text-blue-700 bg-blue-100' 
              : 'text-blue-600 bg-blue-50'
          }`}>
            {isPlaying ? 'Playing...' : 'Click to Listen'}
          </span>
        )}
        
        {!isOutput && onToggleListening && (
          <span className={`px-2 py-1 rounded font-medium ${
            isListening 
              ? 'text-red-600 bg-red-50' 
              : 'text-green-600 bg-green-50'
          }`}>
            {isListening ? 'Stop Recording' : 'Click to Speak'}
          </span>
        )}
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-4 bg-red-500 rounded-full"
                  animate={{ scaleY: [1, 2, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
            <span className="font-medium">🎤 Listening... Say "translate" when ready!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TranslationInput.displayName = 'TranslationInput';

export { TranslationInput };