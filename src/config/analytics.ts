// Google Analytics Configuration
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID

// Initialize Google Analytics
export const initializeGoogleAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;
  
  // Add Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_title: 'Vocabrio Universal Translator',
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'translation_count',
        'custom_parameter_2': 'audio_enabled'
      }
    });
  `;
  document.head.appendChild(script2);

  // Make gtag available globally
  (window as any).gtag = function(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  };
};

// Track custom events
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', eventName, {
      event_category: 'Vocabrio',
      event_label: 'User Interaction',
      ...parameters
    });
  }
};

// Track feedback specifically
export const trackFeedbackEvent = (rating: number, feedback: string, translationCount: number) => {
  trackEvent('feedback_submitted', {
    feedback_rating: rating,
    feedback_length: feedback.length,
    translation_count: translationCount,
    value: rating // GA4 uses 'value' for numeric metrics
  });
};