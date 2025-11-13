import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, Globe, Calendar, Star, AlertTriangle,
  TrendingDown, CheckCircle, XCircle, Clock, Sparkles
} from 'lucide-react';

const AdminTutorDetail = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState('');

  const fetchTutorDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getTutorDetail(tutorId);
      setTutor(data.tutor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    fetchTutorDetail();
  }, [fetchTutorDetail]);

  const handleGenerateAISummary = async () => {
    try {
      setGeneratingAI(true);
      setError('');
      const data = await adminAPI.generateTutorSummary(tutorId);
      setAiSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center">
            <p className="text-red-700">Tutor not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}


        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Tutor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {tutor.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tutor.name}</h1>
                  {tutor.metrics.isHighChurn && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      <span>High Churn Risk</span>
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{tutor.email}</span>
                  </div>
                  {tutor.phoneNumber && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{tutor.phoneNumber}</span>
                    </div>
                  )}
                  {tutor.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{tutor.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{tutor.timezone}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Member since</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(tutor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {tutor.subjects.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.bio && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-700">{tutor.bio}</p>
            </div>
          )}
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Performance Metrics</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Calendar className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tutor.metrics.totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tutor.metrics.completedSessions}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <XCircle className="h-6 w-6 text-red-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tutor.metrics.canceledSessions}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <TrendingDown className="h-6 w-6 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{tutor.metrics.cancellationRate}%</p>
              <p className="text-sm text-gray-600">Cancel Rate</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Star className="h-6 w-6 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{tutor.metrics.averageRating || 'N/A'}</p>
              <p className="text-sm text-gray-600">{tutor.metrics.totalRatings} ratings</p>
            </div>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        {tutor.metrics.totalRatings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Rating Distribution</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = tutor.metrics.ratingDistribution[rating] || 0;
                const percentage = tutor.metrics.totalRatings > 0 
                  ? (count / tutor.metrics.totalRatings) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-4 mb-3 last:mb-0">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* First Session Performance */}
        {tutor.metrics.firstSessionRatings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">First Session Performance</h2>
            {(() => {
              const hasBadFirstSessions = tutor.metrics.badFirstSessionRatings > 0;
              const isHealthy = !hasBadFirstSessions && tutor.metrics.firstSessionRatings > 0;
              const showWarning = hasBadFirstSessions;
              
              return (
                <div className={`p-6 rounded-2xl border-2 ${
                  showWarning 
                    ? 'bg-red-50 border-red-300' 
                    : isHealthy
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start space-x-4">
                    {showWarning ? (
                      <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
                    ) : isHealthy ? (
                      <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                    ) : null}
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${
                        showWarning ? 'text-red-900' : isHealthy ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {showWarning ? 'High Churn Risk Detected' : isHealthy ? 'Healthy First Session Performance' : 'No First Session Data Yet'}
                      </h3>
                      <p className={`mb-3 ${
                        showWarning ? 'text-red-800' : isHealthy ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {tutor.metrics.firstSessionRatings > 0 ? (
                          <>
                            {tutor.metrics.badFirstSessionRatings} out of {tutor.metrics.firstSessionRatings} first sessions
                            rated below 3 stars ({Math.round((tutor.metrics.badFirstSessionRatings / tutor.metrics.firstSessionRatings) * 100)}%).
                            {isHealthy && (
                              <span className="block mt-1">Healthy first sessions are those rated 3, 4, or 5 stars.</span>
                            )}
                          </>
                        ) : (
                          'No first sessions have been rated yet.'
                        )}
                      </p>
                      {showWarning && (
                        <div className="bg-red-100 p-3 rounded-lg">
                          <p className="text-sm text-red-900 font-medium">
                            ⚠️ Recommendation: Review tutor's teaching approach and consider additional training or mentorship.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* AI Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">AI Teaching Analysis</h2>
            <button
              onClick={handleGenerateAISummary}
              disabled={generatingAI || tutor.metrics.totalRatings === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {generatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate AI Summary</span>
                </>
              )}
            </button>
          </div>

          {tutor.metrics.totalRatings === 0 && (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
              <p className="text-gray-600">No ratings available yet. AI analysis requires at least one rating.</p>
            </div>
          )}

          {aiSummary && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="space-y-4">
                {aiSummary.overview && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-700">{aiSummary.overview}</p>
                  </div>
                )}

                {aiSummary.teachingStyle && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teaching Style</h3>
                    <p className="text-gray-700">{aiSummary.teachingStyle}</p>
                  </div>
                )}

                {aiSummary.strengths && aiSummary.strengths.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {aiSummary.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.areasForImprovement && aiSummary.areasForImprovement.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {aiSummary.areasForImprovement.map((area, index) => (
                        <li key={index} className="text-gray-700">{area}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.guidanceQuality && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">💬 Guidance Quality (from Chat Analysis)</h3>
                    <p className="text-blue-800">{aiSummary.guidanceQuality}</p>
                  </div>
                )}

                {aiSummary.churnAnalysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Churn Analysis</h3>
                    <p className="text-gray-700">{aiSummary.churnAnalysis}</p>
                  </div>
                )}

                {aiSummary.recommendation && (
                  <div className="bg-white p-4 rounded-xl border border-purple-300">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Admin Recommendation</h3>
                    <p className="text-purple-800">{aiSummary.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Student Feedback */}
        {tutor.feedbackComments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Student Feedback</h2>
            <div className="space-y-3">
              {tutor.feedbackComments.map((feedback, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {feedback.isFirstSession && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          First Session
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Recent Sessions</h2>
          <div className="space-y-3">
            {tutor.sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Session with {session.student.name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(session.startTime).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{session.duration} min</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : session.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {session.status}
                    </span>
                    {session.rating && (
                      <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-yellow-900">{session.rating.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTutorDetail;

