import React from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TranslateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Translate button clicked');
    if (!disabled && !isLoading) {
      onClick();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled || isLoading}
      type="button"
      className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
        disabled || isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Translating...
        </>
      ) : (
        <>
          <Languages className="h-5 w-5" />
          Translate Now
        </>
      )}
    </motion.button>
  );
};