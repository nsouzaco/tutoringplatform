import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Calendar, TrendingUp, AlertTriangle, Star, ChevronRight } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tutorsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getTutors()
      ]);
      setStats(statsData.stats);
      setTutors(tutorsData.tutors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTutor = (tutorId) => {
    navigate(`/admin/tutor/${tutorId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mb-10">Platform overview and tutor management</p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Platform Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Platform Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Students */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-900">{stats?.totalStudents || 0}</span>
              </div>
              <h3 className="text-blue-900 font-semibold">Total Students</h3>
            </div>

            {/* Total Tutors */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-900">{stats?.totalTutors || 0}</span>
              </div>
              <h3 className="text-purple-900 font-semibold">Total Tutors</h3>
            </div>

            {/* Total Sessions */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-green-900">{stats?.totalSessions || 0}</span>
              </div>
              <h3 className="text-green-900 font-semibold">Total Sessions</h3>
            </div>

            {/* Sessions This Year */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <span className="text-3xl font-bold text-orange-900">{stats?.sessionsThisYear || 0}</span>
              </div>
              <h3 className="text-orange-900 font-semibold">Sessions This Year</h3>
            </div>

            {/* Sessions This Month */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="h-8 w-8 text-pink-600" />
                <span className="text-3xl font-bold text-pink-900">{stats?.sessionsThisMonth || 0}</span>
              </div>
              <h3 className="text-pink-900 font-semibold">Sessions This Month</h3>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-900">{stats?.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <h3 className="text-yellow-900 font-semibold">Average Rating</h3>
            </div>
          </div>
        </motion.div>

        {/* Tutors List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Tutors Overview</h2>
          
          {tutors.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tutors registered yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tutors.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  whileHover={{ y: -2 }}
                  onClick={() => handleViewTutor(tutor.id)}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-purple-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {tutor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <span>{tutor.name}</span>
                            {tutor.metrics.isHighChurn && (
                              <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                <span>High Churn</span>
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{tutor.email}</p>
                        </div>
                      </div>

                      {tutor.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">{tutor.metrics.totalSessions}</p>
                          <p className="text-xs text-gray-600">Total Sessions</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                          <p className="text-2xl font-bold text-gray-900">{tutor.metrics.completedSessions}</p>
                          <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                          <p className="text-2xl font-bold text-orange-600">{tutor.metrics.cancellationRate}%</p>
                          <p className="text-xs text-gray-600">Cancel Rate</p>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            <p className="text-2xl font-bold text-gray-900">{tutor.metrics.averageRating || 'N/A'}</p>
                          </div>
                          <p className="text-xs text-gray-600">{tutor.metrics.totalRatings} ratings</p>
                        </div>
                      </div>

                      {tutor.metrics.isHighChurn && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">
                            ⚠️ {tutor.metrics.badFirstSessionRatings} out of {tutor.metrics.firstSessionRatings} first sessions rated below 3 stars
                          </p>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;



