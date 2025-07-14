// Enhanced Analytics Service with Google Analytics, Supabase, and Email Integration
import { analytics as baseAnalytics } from './analyticsService';
import { trackEvent, trackFeedbackEvent } from '../config/analytics';
import { saveFeedback, saveTranslation } from '../config/supabase';
import type { FeedbackRecord, TranslationRecord } from '../config/supabase';
import { sendFeedbackEmail, type EmailFeedbackData } from './emailService';

export interface EnhancedFeedbackEvent {
  rating: number;
  feedback: string;
  joinBeta: boolean;
  translationCount: number;
  sessionDuration: number;
}

export interface EnhancedTranslationEvent {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  textLength: number;
  audioPlayed: boolean;
  sessionId: string;
}

class EnhancedAnalyticsService {
  private sessionId: string;
  private sessionStart: Date;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
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

  // Enhanced feedback tracking with multiple destinations
  async trackFeedback(feedbackData: EnhancedFeedbackEvent): Promise<void> {
    console.log('📊 Enhanced Analytics: Tracking feedback across all systems...');

    const timestamp = new Date().toISOString();
    const deviceType = this.getDeviceType();
    const userAgent = navigator.userAgent;

    try {
      // 1. Google Analytics
      trackFeedbackEvent(feedbackData.rating, feedbackData.feedback, feedbackData.translationCount);
      console.log('✅ Google Analytics: Feedback tracked');

      // 2. Supabase Database
      const dbFeedback: Omit<FeedbackRecord, 'id' | 'created_at'> = {
        rating: feedbackData.rating,
        feedback_text: feedbackData.feedback,
        translation_count: feedbackData.translationCount,
        session_duration: feedbackData.sessionDuration,
        join_beta: feedbackData.joinBeta,
        user_agent: userAgent,
        language: navigator.language,
        device_type: deviceType
      };

      const dbResult = await saveFeedback(dbFeedback);
      if (dbResult.success) {
        console.log('✅ Supabase: Feedback saved to database');
      } else {
        console.warn('⚠️ Supabase: Failed to save feedback', dbResult.error);
      }

      // 3. Email Notification
      const emailData: EmailFeedbackData = {
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
        translationCount: feedbackData.translationCount,
        sessionDuration: feedbackData.sessionDuration,
        joinBeta: feedbackData.joinBeta,
        userAgent: userAgent,
        timestamp: timestamp
      };

      const emailResult = await sendFeedbackEmail(emailData);
      if (emailResult.success) {
        console.log('✅ Email: Feedback notification sent');
      } else {
        console.warn('⚠️ Email: Failed to send notification', emailResult.message);
      }

      // 4. Base Analytics (local storage/session)
      baseAnalytics.trackFeedback(feedbackData);
      console.log('✅ Base Analytics: Feedback logged locally');

    } catch (error) {
      console.error('❌ Enhanced Analytics: Error tracking feedback', error);
    }
  }

  // Enhanced translation tracking
  async trackTranslation(translationData: EnhancedTranslationEvent): Promise<void> {
    console.log('📊 Enhanced Analytics: Tracking translation...');

    const deviceType = this.getDeviceType();
    const userAgent = navigator.userAgent;

    try {
      // 1. Google Analytics
      trackEvent('translation_completed', {
        source_language: translationData.sourceLanguage,
        target_language: translationData.targetLanguage,
        text_length: translationData.textLength,
        audio_played: translationData.audioPlayed,
        device_type: deviceType
      });

      // 2. Supabase Database
      const dbTranslation: Omit<TranslationRecord, 'id' | 'created_at'> = {
        source_text: translationData.sourceText,
        translated_text: translationData.translatedText,
        source_language: translationData.sourceLanguage,
        target_language: translationData.targetLanguage,
        text_length: translationData.textLength,
        audio_played: translationData.audioPlayed,
        session_id: this.sessionId,
        user_agent: userAgent,
        device_type: deviceType
      };

      const dbResult = await saveTranslation(dbTranslation);
      if (dbResult.success) {
        console.log('✅ Supabase: Translation saved to database');
      } else {
        console.warn('⚠️ Supabase: Failed to save translation', dbResult.error);
      }

      // 3. Base Analytics
      baseAnalytics.trackTranslation({
        sourceLanguage: translationData.sourceLanguage,
        targetLanguage: translationData.targetLanguage,
        textLength: translationData.textLength,
        audioPlayed: translationData.audioPlayed,
        sessionDuration: this.getSessionDuration(),
        deviceType: deviceType
      });

    } catch (error) {
      console.error('❌ Enhanced Analytics: Error tracking translation', error);
    }
  }

  // Track other events
  trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    // Google Analytics
    trackEvent(eventName, properties);
    
    // Base Analytics
    baseAnalytics.trackEvent(eventName, properties);
  }

  trackAudioPlayed(language: string, textLength: number): void {
    this.trackEvent('audio_played', {
      language,
      text_length: textLength,
      device_type: this.getDeviceType()
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
      sessionDuration: this.getSessionDuration()
    };
  }
}

// Global enhanced analytics instance
export const enhancedAnalytics = new EnhancedAnalyticsService();