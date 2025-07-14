/*
  # Create Vocabrio Feedback and Analytics System

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `rating` (integer, 1-5 stars)
      - `feedback_text` (text, optional user feedback)
      - `translation_count` (integer, number of translations completed)
      - `session_duration` (integer, session duration in seconds)
      - `join_beta` (boolean, wants to join beta program)
      - `user_agent` (text, browser information)
      - `language` (text, browser language)
      - `device_type` (text, mobile or desktop)
      - `created_at` (timestamp)

    - `translations`
      - `id` (uuid, primary key)
      - `source_text` (text, original text)
      - `translated_text` (text, translated result)
      - `source_language` (text, source language code)
      - `target_language` (text, target language code)
      - `text_length` (integer, character count)
      - `audio_played` (boolean, was audio played)
      - `session_id` (text, session identifier)
      - `user_agent` (text, browser information)
      - `device_type` (text, mobile or desktop)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read/write access (since this is a public demo app)
    - Add indexes for performance

  3. Analytics Views
    - Create views for common analytics queries
    - Add functions for calculating statistics
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text DEFAULT '',
  translation_count integer NOT NULL DEFAULT 0,
  session_duration integer NOT NULL DEFAULT 0,
  join_beta boolean NOT NULL DEFAULT false,
  user_agent text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text text NOT NULL,
  translated_text text NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  text_length integer NOT NULL DEFAULT 0,
  audio_played boolean NOT NULL DEFAULT false,
  session_id text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo app)
CREATE POLICY "Allow public read access on feedback"
  ON feedback
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on feedback"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access on translations"
  ON translations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on translations"
  ON translations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_device_type ON feedback(device_type);
CREATE INDEX IF NOT EXISTS idx_feedback_join_beta ON feedback(join_beta);

CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translations_languages ON translations(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_translations_session_id ON translations(session_id);
CREATE INDEX IF NOT EXISTS idx_translations_audio_played ON translations(audio_played);

-- Create analytics view for feedback statistics
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT 
  COUNT(*) as total_feedback,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback,
  COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_feedback,
  COUNT(CASE WHEN join_beta = true THEN 1 END) as beta_signups,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_users,
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_users,
  DATE_TRUNC('day', created_at) as feedback_date
FROM feedback
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY feedback_date DESC;

-- Create analytics view for translation statistics
CREATE OR REPLACE VIEW translation_analytics AS
SELECT 
  COUNT(*) as total_translations,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(text_length) as avg_text_length,
  COUNT(CASE WHEN audio_played = true THEN 1 END) as audio_played_count,
  source_language,
  target_language,
  device_type,
  DATE_TRUNC('day', created_at) as translation_date
FROM translations
GROUP BY source_language, target_language, device_type, DATE_TRUNC('day', created_at)
ORDER BY translation_date DESC, total_translations DESC;

-- Create function to get overall statistics
CREATE OR REPLACE FUNCTION get_overall_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_feedback', (SELECT COUNT(*) FROM feedback),
    'total_translations', (SELECT COUNT(*) FROM translations),
    'average_rating', (SELECT ROUND(AVG(rating)::numeric, 2) FROM feedback),
    'unique_sessions', (SELECT COUNT(DISTINCT session_id) FROM translations),
    'beta_signups', (SELECT COUNT(*) FROM feedback WHERE join_beta = true),
    'audio_usage_rate', (
      SELECT ROUND(
        (COUNT(CASE WHEN audio_played = true THEN 1 END)::numeric / COUNT(*)::numeric * 100), 2
      ) FROM translations
    ),
    'mobile_usage_rate', (
      SELECT ROUND(
        (COUNT(CASE WHEN device_type = 'mobile' THEN 1 END)::numeric / COUNT(*)::numeric * 100), 2
      ) FROM feedback
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get recent activity
CREATE OR REPLACE FUNCTION get_recent_activity(limit_count integer DEFAULT 10)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'recent_feedback', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'rating', rating,
          'feedback_text', feedback_text,
          'translation_count', translation_count,
          'device_type', device_type,
          'created_at', created_at
        )
      )
      FROM (
        SELECT * FROM feedback 
        ORDER BY created_at DESC 
        LIMIT limit_count
      ) recent_feedback
    ),
    'recent_translations', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'source_text', source_text,
          'translated_text', translated_text,
          'source_language', source_language,
          'target_language', target_language,
          'audio_played', audio_played,
          'device_type', device_type,
          'created_at', created_at
        )
      )
      FROM (
        SELECT * FROM translations 
        ORDER BY created_at DESC 
        LIMIT limit_count
      ) recent_translations
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;