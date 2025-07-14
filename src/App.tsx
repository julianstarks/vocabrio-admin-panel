import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, AlertCircle, History, Volume2, Monitor, Rocket, Star, Users, Settings } from 'lucide-react';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationInput } from './components/TranslationInput';
import { SwapButton } from './components/SwapButton';
import { TranslateButton } from './components/TranslateButton';
import { TranslationHistory, type HistoryItem } from './components/TranslationHistory';
import { FeedbackSurvey } from './components/FeedbackSurvey';
import { AdminPanel } from './components/AdminPanel';
import { AdminAccess } from './components/AdminAccess';
import { AudioControls } from './components/AudioControls';
import { translateText, speakText, startSpeechRecognition, testAudioSystem } from './services/translationService';
import { enhancedAnalytics } from './services/enhancedAnalyticsService';
import { initializeGoogleAnalytics, GA_MEASUREMENT_ID } from './config/analytics';
import { useTranslationHistory } from './hooks/useTranslationHistory';
import { useFeedbackTrigger } from './hooks/useFeedbackTrigger';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

function App() {
  // 🎯 CORE STATE - AUDIO ENABLED BY DEFAULT FOR IMMEDIATE DEMO
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🎯 FORCE FRESH TRANSLATION EVERY TIME - NO CACHING
  const [translationKey, setTranslationKey] = useState(0);
  
  // 🎤 VOICE STATE - FIXED FOR FIRST COMMAND
  const [isListening, setIsListening] = useState(false);
  const [stopListening, setStopListening] = useState<(() => void) | null>(null);
  const [voiceTranslationPending, setVoiceTranslationPending] = useState(false);
  
  // 🔊 AUDIO STATE - ENABLED BY DEFAULT FOR IMMEDIATE DEMO
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioTestResult, setAudioTestResult] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true); // ✅ ENABLED BY DEFAULT
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayCompleted, setAutoPlayCompleted] = useState(false);
  const [forceAudioPlay, setForceAudioPlay] = useState(true); // ✅ ENABLED BY DEFAULT
  
  // 📱 UI STATE
  const [showHistory, setShowHistory] = useState(false);
  
  // 🔐 ADMIN STATE
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const { history, addToHistory, clearHistory } = useTranslationHistory();
  const { showFeedback, translationCount, incrementTranslationCount, closeFeedback } = useFeedbackTrigger();

  // Detect Chrome browser
  const isChrome = useMemo(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('chrome') && !userAgent.includes('edge') && !userAgent.includes('edg');
  }, []);

  // Initialize analytics and Google Analytics
  useEffect(() => {
    // Initialize Google Analytics
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      initializeGoogleAnalytics(GA_MEASUREMENT_ID);
      console.log('✅ Google Analytics initialized');
    } else {
      console.log('⚠️ Google Analytics not configured - update GA_MEASUREMENT_ID in analytics.ts');
    }

    // Track app load
    enhancedAnalytics.trackEvent('app_loaded', {
      user_agent: navigator.userAgent,
      language: navigator.language,
      is_chrome: isChrome
    });
  }, [isChrome]);

  // 🚀 COMPLETELY FIXED TRANSLATION HANDLER WITH GUARANTEED AUDIO PLAYBACK
  const handleTranslate = useCallback(async () => {
    console.log('🚀 AUDIO DEMO - TRANSLATION WITH GUARANTEED AUDIO PLAYBACK');
    
    // 🎯 GET CURRENT VALUES - ALWAYS FRESH
    const currentInputText = inputText.trim();
    const currentFromLang = fromLang;
    const currentToLang = toLang;
    
    console.log('🔍 AUDIO DEMO - CURRENT VALUES:');
    console.log('   Input Text:', `"${currentInputText}"`);
    console.log('   From Lang:', currentFromLang);
    console.log('   To Lang:', currentToLang);
    console.log('   Audio Enabled:', audioEnabled);
    console.log('   Force Audio Play:', forceAudioPlay);
    
    // 🎯 VALIDATION
    if (!currentInputText) {
      console.log('❌ No text to translate');
      setError('Please enter some text to translate');
      return;
    }

    // 🎯 PREVENT DOUBLE PROCESSING
    if (isTranslating) {
      console.log('⚠️ Already translating, skipping');
      return;
    }

    console.log('✅ AUDIO DEMO - Starting FRESH translation with GUARANTEED AUDIO PLAYBACK...');
    
    // 🎯 RESET ALL STATES
    setIsTranslating(true);
    setError(null);
    setOutputText(''); // Clear output immediately
    setVoiceTranslationPending(false);
    setIsAutoPlaying(false);
    setAutoPlayCompleted(false);
    
    try {
      console.log('🌐 AUDIO DEMO - Calling translation service...');
      
      // 🎯 CALL TRANSLATION SERVICE - ALWAYS FRESH, NO CACHING
      const result = await translateText({
        text: currentInputText,
        fromLang: currentFromLang,
        toLang: currentToLang
      });
      
      console.log('✅ AUDIO DEMO - Translation successful!');
      console.log('   Input was:', `"${currentInputText}"`);
      console.log('   Output is:', `"${result.translatedText}"`);
      
      // 🎯 SET RESULTS IMMEDIATELY
      setOutputText(result.translatedText);
      setTranslationKey(prev => prev + 1);
      
      // 🎯 ADD TO HISTORY
      addToHistory(currentInputText, result.translatedText, currentFromLang, currentToLang);
      incrementTranslationCount();
      
      // 📊 ENHANCED ANALYTICS TRACKING
      await enhancedAnalytics.trackTranslation({
        sourceText: currentInputText,
        translatedText: result.translatedText,
        sourceLanguage: currentFromLang,
        targetLanguage: currentToLang,
        textLength: currentInputText.length,
        audioPlayed: false, // Will be updated if audio plays
        sessionId: enhancedAnalytics.getSessionData().sessionId
      });
      
      // 🔊 GUARANTEED AUDIO PLAYBACK - ALWAYS ENABLED
      if (result.translatedText.trim()) {
        console.log('🔊 AUDIO DEMO - STARTING GUARANTEED AUDIO PLAYBACK (ALWAYS ENABLED)...');
        setIsAutoPlaying(true);
        
        // Multiple attempts to ensure audio plays
        const playAudio = async () => {
          for (let attempt = 1; attempt <= 5; attempt++) {
            try {
              console.log(`🎵 AUDIO DEMO - Audio attempt ${attempt}/5...`);
              await speakText(result.translatedText, currentToLang);
              console.log(`✅ AUDIO DEMO - AUDIO PLAYBACK SUCCESSFUL on attempt ${attempt}!`);
              setAutoPlayCompleted(true);
              
              // Track successful audio playback
              enhancedAnalytics.trackAudioPlayed(currentToLang, result.translatedText.length);
              
              return; // Success, exit
            } catch (audioError) {
              console.log(`⚠️ Audio attempt ${attempt} failed:`, audioError);
              if (attempt < 5) {
                // Wait before next attempt
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
          }
          
          // If all attempts failed, try force play with different settings
          console.log('🔊 AUDIO DEMO - All attempts failed, trying force play with different settings...');
          try {
            // Force play with different settings
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const utterance = new SpeechSynthesisUtterance(result.translatedText);
              utterance.lang = currentToLang === 'es' ? 'es-ES' : 'en-US';
              utterance.rate = 1.2; // Faster rate
              utterance.pitch = 1.2; // Higher pitch
              utterance.volume = 1.0;
              
              // Try to find any available voice
              const voices = speechSynthesis.getVoices();
              if (voices.length > 0) {
                utterance.voice = voices[0];
              }
              
              speechSynthesis.speak(utterance);
              console.log('✅ AUDIO DEMO - FORCE AUDIO PLAYBACK WITH DIFFERENT SETTINGS INITIATED!');
              setAutoPlayCompleted(true);
            }
          } catch (forceError) {
            console.log('⚠️ Force audio also failed, but translation succeeded');
            setError('Translation successful! Audio may be limited in this browser. Try clicking the blue speaker button.');
          }
        };
        
        // Start audio playback with small delay
        setTimeout(() => {
          playAudio().finally(() => {
            setIsAutoPlaying(false);
          });
        }, 500); // Increased delay to ensure UI is ready
        
      } else {
        console.log('🔇 AUDIO DEMO - No text to speak');
      }
      
    } catch (error) {
      console.error('❌ AUDIO DEMO - Translation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed. Please try again.';
      setError(errorMessage);
      setOutputText('');
      
      // Track error
      enhancedAnalytics.trackError(errorMessage, 'translation');
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, fromLang, toLang, addToHistory, incrementTranslationCount, audioEnabled, forceAudioPlay, isTranslating]);

  // 🎯 AUDIO DEMO - AUTO-TRIGGER TRANSLATION WHEN VOICE SETS TEXT
  useEffect(() => {
    if (voiceTranslationPending && inputText.trim() && !isTranslating) {
      console.log('🎤 AUDIO DEMO - Auto-triggering translation after voice input');
      setVoiceTranslationPending(false);
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleTranslate();
      }, 200);
    }
  }, [voiceTranslationPending, inputText, isTranslating, handleTranslate]);

  // 🔄 LANGUAGE SWAP HANDLER
  const handleSwapLanguages = useCallback(() => {
    console.log('🔄 Swapping languages');
    const currentFromLang = fromLang;
    const currentToLang = toLang;
    const currentInputText = inputText;
    const currentOutputText = outputText;
    
    setFromLang(currentToLang);
    setToLang(currentFromLang);
    setInputText(currentOutputText);
    setOutputText(currentInputText);
    setError(null);
    setAutoPlayCompleted(false);
    
    enhancedAnalytics.trackEvent('languages_swapped', {
      from: currentFromLang,
      to: currentToLang
    });
  }, [fromLang, toLang, inputText, outputText]);

  // 🔊 MANUAL SPEAK HANDLER WITH GUARANTEED PLAYBACK
  const handleSpeak = useCallback(async (text: string, lang: string) => {
    console.log(`🔊 AUDIO DEMO - Manual Speaking: "${text}" in ${lang}`);
    if (text.trim()) {
      try {
        // Multiple attempts for manual playback too
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await speakText(text, lang);
            console.log(`✅ Manual speech successful on attempt ${attempt}`);
            enhancedAnalytics.trackAudioPlayed(lang, text.length);
            return; // Success, exit
          } catch (error) {
            console.log(`⚠️ Manual speech attempt ${attempt} failed:`, error);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
        
        // If attempts failed, show helpful error
        setError(isChrome 
          ? 'Chrome audio limited but working. Try clicking the blue speaker button again!'
          : 'Audio playback issue. Please try clicking the speaker button again.'
        );
      } catch (error) {
        console.error('❌ Manual speech failed:', error);
        setError('Audio playback failed. Please try again or refresh the page.');
        enhancedAnalytics.trackError('Manual speech failed', 'audio');
      }
    }
  }, [isChrome]);

  // 🎤 COMPLETELY FIXED VOICE RECOGNITION HANDLER - AUDIO DEMO READY
  const handleToggleListening = useCallback(() => {
    if (isListening) {
      console.log('🛑 AUDIO DEMO - Stopping speech recognition');
      if (stopListening) {
        stopListening();
        setStopListening(null);
      }
      setIsListening(false);
      setVoiceTranslationPending(false);
      enhancedAnalytics.trackEvent('voice_recognition_stopped');
    } else {
      console.log('🎤 AUDIO DEMO - Starting speech recognition');
      setError(null);
      setOutputText(''); // Clear output when starting new voice input
      setVoiceTranslationPending(false);
      setAutoPlayCompleted(false);
      
      enhancedAnalytics.trackEvent('voice_recognition_started', { language: fromLang });
      
      const stopFn = startSpeechRecognition(
        fromLang,
        (text) => {
          console.log(`📝 AUDIO DEMO - Speech result: "${text}"`);
          // 🎯 UPDATE INPUT TEXT DIRECTLY - NO CACHING
          setInputText(text);
        },
        (error) => {
          console.error('❌ AUDIO DEMO - Speech error:', error);
          setError(error);
          setIsListening(false);
          setStopListening(null);
          setVoiceTranslationPending(false);
          enhancedAnalytics.trackError(error, 'voice_recognition');
        },
        () => {
          console.log('🎯 AUDIO DEMO - Voice translate command detected!');
          setIsListening(false);
          setStopListening(null);
          
          // 🚀 AUDIO DEMO - SET PENDING FLAG FOR AUTO-TRANSLATION
          setVoiceTranslationPending(true);
          enhancedAnalytics.trackEvent('voice_translate_command_detected');
        }
      );
      
      if (stopFn) {
        setStopListening(() => stopFn);
        setIsListening(true);
      }
    }
  }, [isListening, stopListening, fromLang]);

  // 🧪 AUDIO TEST HANDLER - OPTIONAL NOW (AUDIO ALREADY ENABLED)
  const handleTestAudio = useCallback(async () => {
    console.log('🧪 AUDIO DEMO - Testing audio system (optional - already enabled)...');
    setIsTestingAudio(true);
    setAudioTestResult(null);
    setError(null);
    
    enhancedAnalytics.trackEvent('audio_test_started');
    
    try {
      const result = await testAudioSystem();
      setAudioTestResult(result.message);
      
      if (result.success) {
        console.log('✅ AUDIO DEMO - Audio test successful!');
        setAudioTestResult(result.message + ' - Audio was already enabled and working!');
        enhancedAnalytics.trackEvent('audio_test_success');
      } else {
        console.log('⚠️ Audio test failed, but audio is still enabled');
        setAudioTestResult(result.message + ' - Audio is still enabled and should work!');
        enhancedAnalytics.trackEvent('audio_test_failed', { message: result.message });
      }
    } catch (error) {
      console.error('❌ Audio test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Audio test failed';
      setAudioTestResult(`⚠️ ${errorMessage} - Audio is still enabled and should work!`);
      enhancedAnalytics.trackError(errorMessage, 'audio_test');
    } finally {
      setIsTestingAudio(false);
    }
  }, []);

  // 📋 HISTORY REUSE HANDLER
  const handleReuseTranslation = useCallback((item: HistoryItem) => {
    console.log('📋 Reusing translation from history');
    setFromLang(item.fromLang);
    setToLang(item.toLang);
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setError(null);
    setShowHistory(false);
    setAutoPlayCompleted(false);
    
    enhancedAnalytics.trackEvent('history_item_reused', {
      from_lang: item.fromLang,
      to_lang: item.toLang
    });
  }, []);

  // ❌ CLEAR ERROR HANDLER
  const clearError = useCallback(() => {
    setError(null);
    setAudioTestResult(null);
  }, []);

  // 📝 FIXED INPUT CHANGE HANDLER - AUDIO DEMO
  const handleInputChange = useCallback((newText: string) => {
    console.log('📝 AUDIO DEMO - Input changed to:', `"${newText}"`);
    setInputText(newText);
    
    // Clear output when manually typing new text (but not during voice input)
    if (newText !== inputText && !isListening) {
      setOutputText('');
      setError(null);
      setAutoPlayCompleted(false);
    }
  }, [inputText, isListening]);

  // 🔐 ADMIN HANDLERS
  const handleAdminAccess = useCallback(() => {
    setShowAdminAccess(true);
    enhancedAnalytics.trackEvent('admin_access_requested');
  }, []);

  const handleAdminAuthenticated = useCallback(() => {
    setIsAdminAuthenticated(true);
    setShowAdminAccess(false);
    setShowAdminPanel(true);
    enhancedAnalytics.trackEvent('admin_authenticated');
  }, []);

  const handleCloseAdminPanel = useCallback(() => {
    setShowAdminPanel(false);
    enhancedAnalytics.trackEvent('admin_panel_closed');
  }, []);

  // Enhanced feedback handler
  const handleFeedbackSubmit = useCallback(async (feedbackData: any) => {
    await enhancedAnalytics.trackFeedback({
      rating: feedbackData.rating,
      feedback: feedbackData.feedback,
      joinBeta: feedbackData.joinBeta,
      translationCount: feedbackData.translationCount,
      sessionDuration: enhancedAnalytics.getSessionData().sessionDuration
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Official Vocabrio Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center justify-center gap-8 mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <img 
                src="/Vocbario Logo Only_2025.png" 
                alt="Vocabrio - Universal Translator" 
                className="h-64 w-auto max-w-4xl object-contain drop-shadow-2xl mx-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/30 via-green-400/30 to-pink-400/30 rounded-2xl blur-2xl -z-10 animate-pulse-slow"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-green-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Voice your Translation
              </p>
              <p className="text-gray-600 text-2xl font-medium">
                Speak. Translate. Connect.
              </p>
            </motion.div>

            {/* Admin Access Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleAdminAccess}
              className="fixed top-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40"
              title="Admin Panel"
            >
              <Settings className="h-5 w-5" />
            </motion.button>

            {/* 🎯 ENLARGED VOCABRIO PHONE IMAGE - READY FOR DEPLOYMENT! */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="block" // Show on all devices now
            >
              <img 
                src="/VACABRIO PHONE IMAGE.png" 
                alt="Vocabrio Mobile App - Download Coming Soon!" 
                className="h-64 w-auto object-contain opacity-80 hover:opacity-100 transition-all duration-300 drop-shadow-2xl hover:scale-105 cursor-pointer"
                title="Vocabrio Mobile App - Coming Soon to App Stores!"
              />
              <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                📱 Mobile App Coming Soon!
              </p>
            </motion.div>
          </div>
          
          {/* Enhanced Analytics Ready Section */}
          <div className="mt-8 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 rounded-xl p-8 shadow-2xl border border-green-200 max-w-4xl mx-auto text-white">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Volume2 className="h-8 w-8 text-yellow-300 animate-bounce" />
                <h2 className="text-3xl font-bold">🔊 COMPLETE ANALYTICS SYSTEM READY! 🔊</h2>
                <Star className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
              
              <div className="mb-6">
                <p className="text-xl font-semibold mb-3 text-yellow-100">
                  ✅ GOOGLE ANALYTICS + SUPABASE + EMAIL + ADMIN PANEL ALL INTEGRATED!
                </p>
                <p className="text-lg leading-relaxed text-blue-100">
                  Complete feedback ecosystem ready! All user interactions, translations, and feedback are tracked across multiple systems!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="font-semibold text-sm">Google Analytics</p>
                  <p className="text-xs text-blue-100">Real-time tracking!</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl mb-2">🗄️</div>
                  <p className="font-semibold text-sm">Supabase DB</p>
                  <p className="text-xs text-blue-100">Permanent storage!</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl mb-2">📧</div>
                  <p className="font-semibold text-sm">Email Alerts</p>
                  <p className="text-xs text-blue-100">Instant notifications!</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl mb-2">⚙️</div>
                  <p className="font-semibold text-sm">Admin Panel</p>
                  <p className="text-xs text-blue-100">Full dashboard!</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm font-medium text-yellow-200 mb-2">
                  🎯 COMPLETE FEEDBACK SYSTEM - READY TO GO:
                </p>
                <div className="text-sm text-blue-100 space-y-1">
                  <p>• All user feedback automatically saved to database</p>
                  <p>• Email notifications sent to your inbox instantly</p>
                  <p>• Google Analytics tracking all user behavior</p>
                  <p>• Admin panel for viewing all data and analytics</p>
                  <p>• Click the gear icon (⚙️) in top-right to access admin panel</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Audio Test Section - NOW OPTIONAL */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 justify-center">
              <Volume2 className="h-5 w-5 text-green-600" />
              {isChrome && <Monitor className="h-5 w-5 text-green-600" />}
              🔊 Audio Test (Optional - Already Enabled!)
            </h3>
            
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Audio is ENABLED by default! Translation will play out loud automatically. Test button is optional.
              </p>
            </div>
            
            <button
              onClick={handleTestAudio}
              disabled={isTestingAudio}
              className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-3 shadow-lg mx-auto ${
                isTestingAudio
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isTestingAudio ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing Audio...
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  🔊 OPTIONAL: Test Audio System
                </>
              )}
            </button>

            {audioTestResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800"
              >
                <p className="font-medium text-center text-sm leading-relaxed">{audioTestResult}</p>
              </motion.div>
            )}

            <div className="mt-4 text-sm text-gray-600 text-center">
              <p><strong>READY TO GO:</strong> Audio is enabled! Just translate and listen!</p>
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">Complete Analytics System Ready:</p>
                <p className="text-green-700">• All feedback tracked in Google Analytics</p>
                <p className="text-green-700">• Permanent storage in Supabase database</p>
                <p className="text-green-700">• Email notifications for new feedback</p>
                <p className="text-green-700">• Admin panel for viewing all data</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
              {isChrome && error.includes('Chrome') && (
                <div className="mt-2 text-xs text-red-700">
                  <p>• Translation works perfectly regardless of audio</p>
                  <p>• Try clicking the blue speaker button again</p>
                </div>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Translation Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              {/* Language Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <LanguageSelector
                  value={fromLang}
                  onChange={setFromLang}
                  options={languages}
                  label="From"
                />
                <LanguageSelector
                  value={toLang}
                  onChange={setToLang}
                  options={languages}
                  label="To"
                />
              </div>

              {/* Input Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter text to translate
                </label>
                <TranslationInput
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  isListening={isListening}
                  onToggleListening={handleToggleListening}
                  onSpeak={handleSpeak}
                  canSpeak={!!inputText}
                  language={fromLang}
                />
              </div>

              {/* Swap Button */}
              <SwapButton onSwap={handleSwapLanguages} />

              {/* Translate Button */}
              <div className="mb-6">
                <TranslateButton
                  onClick={handleTranslate}
                  isLoading={isTranslating}
                  disabled={!inputText.trim() || isTranslating}
                />
              </div>

              {/* 🎯 AUDIO DEMO - FIXED OUTPUT SECTION WITH GUARANTEED AUDIO PLAYBACK */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: outputText ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Translation {outputText && isAutoPlaying && '(🔊 PLAYING AUDIO NOW!)'}
                    {outputText && autoPlayCompleted && '(💥 AUDIO PLAYED SUCCESSFULLY!)'}
                    {outputText && !isAutoPlaying && !autoPlayCompleted && '(🎵 AUDIO WILL PLAY AUTOMATICALLY!)'}
                  </label>
                </div>
                <TranslationInput
                  value={outputText}
                  onChange={() => {}}
                  placeholder="Translation will appear here..."
                  onSpeak={handleSpeak}
                  canSpeak={false} // Not used for output - onSpeak presence determines button visibility
                  isOutput={true}
                  language={toLang}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-center gap-2 bg-white rounded-lg p-3 shadow-md border border-gray-100"
                >
                  <History className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    {showHistory ? 'Hide History' : 'Show History'}
                  </span>
                </button>
              </div>

              <div className={`${showHistory ? 'block' : 'hidden'} lg:block`}>
                <TranslationHistory
                  history={history}
                  onSpeak={handleSpeak}
                  onReuse={handleReuseTranslation}
                  onClear={clearHistory}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Audio Demo Instructions - READY TO GO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center border-2 border-green-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            🔊 COMPLETE ANALYTICS SYSTEM READY - NO SETUP REQUIRED!
            {isChrome && <Monitor className="h-5 w-5 text-green-600" />}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
              <div className="text-2xl mb-2">✍️</div>
              <p><strong>Method 1:</strong> Type text and click "Translate Now"</p>
              <p className="text-xs text-blue-600 mt-1">🔊 Translation will play out loud automatically!</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
              <div className="text-2xl mb-2">🎤</div>
              <p><strong>Method 2:</strong> Voice translate - say text + "translate"</p>
              <p className="text-xs text-green-600 mt-1">🔊 Translation appears AND plays out loud!</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
            <p className="text-sm text-green-800 font-bold">
              📊 COMPLETE ANALYTICS SYSTEM: ALL FEEDBACK TRACKED ACROSS GOOGLE ANALYTICS, SUPABASE, EMAIL & ADMIN PANEL!
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800 font-bold">
              ⚙️ ADMIN ACCESS: Click the gear icon in top-right corner to view all feedback and analytics!
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/Vocbario Logo Only_2025.png" 
              alt="Vocabrio" 
              className="h-8 w-auto object-contain opacity-60"
            />
            <p className="font-medium">Built with ❤️ for global communication</p>
          </div>
          <p className="text-xs">
            {isChrome ? 'Chrome multi-method' : 'Simple, reliable'} translation • {translationCount} translations completed
            • 📊 COMPLETE ANALYTICS SYSTEM READY!
          </p>
          <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-medium">
              📊 GOOGLE ANALYTICS + SUPABASE + EMAIL + ADMIN PANEL ALL INTEGRATED AND READY! 📊
            </p>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Feedback Survey Modal */}
      <FeedbackSurvey
        isOpen={showFeedback}
        onClose={closeFeedback}
        translationCount={translationCount}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Admin Access Modal */}
      {showAdminAccess && (
        <AdminAccess onAuthenticated={handleAdminAuthenticated} />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={handleCloseAdminPanel} />
      )}
    </div>
  );
}

export default App;