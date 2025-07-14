import { useState, useEffect } from 'react';
import { analytics } from '../services/analyticsService';

export const useFeedbackTrigger = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [translationCount, setTranslationCount] = useState(0);

  useEffect(() => {
    // Check if feedback should be triggered based on translation count
    const shouldTriggerFeedback = () => {
      // Trigger feedback after 3, 5, 10, 20, 50 translations
      const triggerPoints = [3, 5, 10, 20, 50];
      return triggerPoints.includes(translationCount);
    };

    if (shouldTriggerFeedback()) {
      // Add a small delay to not interrupt the user experience
      const timer = setTimeout(() => {
        setShowFeedback(true);
        analytics.trackEvent('feedback_triggered', { 
          translation_count: translationCount,
          trigger_point: translationCount
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [translationCount]);

  const incrementTranslationCount = () => {
    setTranslationCount(prev => prev + 1);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
  };

  return {
    showFeedback,
    translationCount,
    incrementTranslationCount,
    closeFeedback
  };
};