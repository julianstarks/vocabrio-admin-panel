import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SwapButtonProps {
  onSwap: () => void;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onSwap }) => {
  return (
    <div className="flex justify-center my-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, rotate: 180 }}
        onClick={onSwap}
        className="p-3 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
        title="Swap languages"
      >
        <ArrowLeftRight className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
      </motion.button>
    </div>
  );
};