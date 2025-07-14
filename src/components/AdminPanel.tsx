import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Download,
  RefreshCw,
  Calendar,
  Globe,
  Volume2
} from 'lucide-react';
import { getAllFeedback, getAllTranslations, getFeedbackStats } from '../config/supabase';
import type { FeedbackRecord, TranslationRecord } from '../config/supabase';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [translations, setTranslations] = useState<TranslationRecord[]>([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    totalTranslations: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'translations'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedbackResult, translationsResult, statsResult] = await Promise.all([
        getAllFeedback(),
        getAllTranslations(),
        getFeedbackStats()
      ]);

      if (feedbackResult.success) setFeedback(feedbackResult.data || []);
      if (translationsResult.success) setTranslations(translationsResult.data || []);
      if (statsResult.success) setStats(statsResult.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      feedback,
      translations,
      stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabrio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Vocabrio Admin Panel</h2>
              <p className="text-blue-100">Analytics, Feedback & User Data</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={loadData}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'translations', label: 'Translations', icon: Globe }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Translations</p>
                      <p className="text-3xl font-bold">{stats.totalTranslations}</p>
                    </div>
                    <Globe className="h-12 w-12 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Feedback Received</p>
                      <p className="text-3xl font-bold">{stats.totalFeedback}</p>
                    </div>
                    <MessageSquare className="h-12 w-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Average Rating</p>
                      <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
                    </div>
                    <Star className="h-12 w-12 text-yellow-200" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {feedback.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex">{getRatingStars(item.rating)}</div>
                        <span className="text-sm text-gray-600">
                          {item.feedback_text ? item.feedback_text.substring(0, 50) + '...' : 'No comment'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.created_at && formatDate(item.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">All Feedback ({feedback.length})</h3>
                <div className="text-sm text-gray-600">
                  Average: {stats.averageRating.toFixed(1)}/5 stars
                </div>
              </div>
              
              <div className="space-y-4">
                {feedback.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex">{getRatingStars(item.rating)}</div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.rating}/5 stars
                        </span>
                        {item.join_beta && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Beta Interest
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {item.created_at && formatDate(item.created_at)}
                      </span>
                    </div>
                    
                    {item.feedback_text && (
                      <p className="text-gray-700 mb-3">{item.feedback_text}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Translations: {item.translation_count}</span>
                      <span>Session: {Math.floor(item.session_duration / 60)}min</span>
                      <span>Device: {item.device_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Translation History ({translations.length})</h3>
              </div>
              
              <div className="space-y-4">
                {translations.slice(0, 50).map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                          {item.source_language?.toUpperCase()} → {item.target_language?.toUpperCase()}
                        </span>
                        {item.audio_played && (
                          <Volume2 className="h-4 w-4 text-blue-500" title="Audio played" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.created_at && formatDate(item.created_at)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Input:</span>
                        <span className="ml-2 text-gray-900">{item.source_text}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Output:</span>
                        <span className="ml-2 text-blue-700">{item.translated_text}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Length: {item.text_length} chars</span>
                      <span>Device: {item.device_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};