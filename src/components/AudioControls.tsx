import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface AudioControlsProps {
  text: string;
  language: string;
  onSpeak: (text: string, language: string) => void;
  autoPlay?: boolean;
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  text,
  language,
  onSpeak,
  autoPlay = false,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
  }, [text, autoPlay]);

  const handlePlay = () => {
    if (!text) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      onSpeak(text, language);
      setIsPlaying(true);
      
      // Auto-stop tracking after estimated duration
      const estimatedDuration = text.length * 100; // ~100ms per character
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedDuration);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    if ('speechSynthesis' in window) {
      // Note: Web Speech API doesn't support volume control directly
      // This is more for UI feedback
    }
  };

  if (!text) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePlay}
        className={`p-2 rounded-full transition-all duration-200 ${
          isPlaying
            ? 'bg-primary-100 text-primary-700 shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
        }`}
        title={isPlaying ? 'Stop audio' : 'Play audio'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </motion.button>

      {/* Volume Control */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleVolumeToggle}
        className={`p-2 rounded-full transition-all duration-200 ${
          isMuted
            ? 'bg-red-100 text-red-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="h-3 w-3" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
      </motion.button>

      {/* Audio Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-3 bg-primary-500 rounded-full"
              animate={{ scaleY: [1, 2, 1] }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {autoPlay && (
        <span className="text-xs text-primary-600 font-medium">
          Auto-play
        </span>
      )}
    </div>
  );
};