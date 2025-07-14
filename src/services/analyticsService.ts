// Analytics service for tracking user behavior
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface TranslationEvent {
  sourceLanguage: string;
  targetLanguage: string;
  textLength: number;
  audioPlayed: boolean;
  sessionDuration: number;
  deviceType: string;
}

export interface FeedbackEvent {
  rating: number;
  feedback: string;
  joinBeta: boolean;
  translationCount: number;
  sessionDuration: number;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStart: Date;
  private events: AnalyticsEvent[] = [];
  private translationCount: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.trackEvent('session_started', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      deviceType: this.getDeviceType()
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart.getTime()) / 1000);
  }

  trackEvent(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionDuration: this.getSessionDuration(),
        translationCount: this.translationCount
      },
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', event, properties);
    }

    // Log for development
    console.log('Analytics Event:', analyticsEvent);
  }

  trackTranslation(data: TranslationEvent): void {
    this.translationCount++;
    this.trackEvent('translation_submitted', {
      source_language: data.sourceLanguage,
      target_language: data.targetLanguage,
      text_length: data.textLength,
      audio_played: data.audioPlayed,
      session_duration: data.sessionDuration,
      device_type: data.deviceType,
      translation_number: this.translationCount
    });
  }

  trackAudioPlayed(language: string, textLength: number): void {
    this.trackEvent('audio_played', {
      language,
      text_length: textLength,
      device_type: this.getDeviceType()
    });
  }

  trackFeedback(data: FeedbackEvent): void {
    this.trackEvent('feedback_submitted', {
      rating: data.rating,
      feedback_length: data.feedback.length,
      join_beta: data.joinBeta,
      translation_count: data.translationCount,
      session_duration: data.sessionDuration
    });
  }

  trackError(error: string, context: string): void {
    this.trackEvent('error_occurred', {
      error_message: error,
      context,
      device_type: this.getDeviceType()
    });
  }

  getSessionData() {
    return {
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      sessionDuration: this.getSessionDuration(),
      translationCount: this.translationCount,
      events: this.events
    };
  }

  exportData(): string {
    return JSON.stringify({
      session: this.getSessionData(),
      events: this.events
    }, null, 2);
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Google Analytics setup function
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
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};