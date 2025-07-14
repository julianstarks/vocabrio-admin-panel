import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types - FIXED EXPORTS
export interface FeedbackRecord {
  id?: string;
  rating: number;
  feedback_text: string;
  translation_count: number;
  session_duration: number;
  join_beta: boolean;
  user_agent: string;
  language: string;
  device_type: string;
  created_at?: string;
}

export interface TranslationRecord {
  id?: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  text_length: number;
  audio_played: boolean;
  session_id: string;
  user_agent: string;
  device_type: string;
  created_at?: string;
}

// Feedback database operations
export const saveFeedback = async (feedback: Omit<FeedbackRecord, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedback])
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving feedback:', error);
    return { success: false, error };
  }
};

// Translation database operations
export const saveTranslation = async (translation: Omit<TranslationRecord, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('translations')
      .insert([translation])
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving translation:', error);
    return { success: false, error };
  }
};

// Admin operations
export const getAllFeedback = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { success: false, error };
  }
};

export const getAllTranslations = async () => {
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching translations:', error);
    return { success: false, error };
  }
};

export const getFeedbackStats = async () => {
  try {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('rating, created_at');
    
    const { data: translationData, error: translationError } = await supabase
      .from('translations')
      .select('created_at');
    
    if (feedbackError || translationError) {
      throw feedbackError || translationError;
    }
    
    const avgRating = feedbackData.length > 0 
      ? feedbackData.reduce((sum, item) => sum + item.rating, 0) / feedbackData.length 
      : 0;
    
    return {
      success: true,
      data: {
        totalFeedback: feedbackData.length,
        totalTranslations: translationData.length,
        averageRating: avgRating,
        feedbackData,
        translationData
      }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error };
  }
};