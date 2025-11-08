import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, User, Mail, Globe, BookOpen, ArrowRight, AlertCircle, Video, Clock, Phone, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { userData } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.getSessions({ upcoming: true });
      setSessions(data.sessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }

    try {
      await sessionsAPI.cancelSession(sessionId);
      fetchSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isTutor = userData.role === 'TUTOR';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">
            Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{userData.name}</span>!
          </h1>
          <p className="text-gray-600 mb-10">Here's what's happening with your learning journey</p>
        </motion.div>

        <div className="grid md:grid-cols-[30%_70%] gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 p-3 rounded-2xl border border-gray-200 hover:border-purple-500/50 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900">Your Profile</h2>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs">{userData.email}</span>
              </div>
              {userData.phoneNumber && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs">{userData.phoneNumber}</span>
                </div>
              )}
              {userData.location && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs">{userData.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-700">
                <Globe className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs">{userData.timezone}</span>
              </div>
              {isTutor && userData.tutorProfile && (
                <>
                  {userData.tutorProfile.subjects && userData.tutorProfile.subjects.length > 0 && (
                      <div className="flex items-start space-x-3">
                      <BookOpen className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          {userData.tutorProfile.subjects.map((subject, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {userData.tutorProfile.bio && (
                    <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                      {userData.tutorProfile.bio}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 rounded-2xl border border-gray-200 p-3 shadow-sm"
          >
          <h2 className="text-base font-semibold mb-3 text-gray-900 flex items-center space-x-2">
            <Video className="h-4 w-4 text-purple-600" />
            <span>Upcoming Sessions</span>
          </h2>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-xs">No upcoming sessions scheduled.</p>
              {!isTutor && (
                <Link
                  to="/tutors"
                  className="inline-flex items-center space-x-1 mt-2 text-purple-600 hover:text-purple-700 transition-colors text-xs"
                >
                  <span>Book your first session</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const otherUser = isTutor ? session.student : session.tutor;
                const isLive = session.status === 'LIVE';
                const canJoin = session.status === 'SCHEDULED' || session.status === 'LIVE';

                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ y: -2 }}
                    className="bg-white border border-gray-200 hover:border-purple-400 rounded-xl p-3 transition-all shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1.5">
                          <h3 className="font-semibold text-sm text-gray-900">
                            Session with {otherUser.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              isLive
                                ? 'bg-green-100 text-green-700 animate-pulse'
                                : session.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(session.startTime).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(session.startTime).toLocaleTimeString()} ({session.duration} min)</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {canJoin && (
                          <Link
                            to={`/session/${session.id}`}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-md ${
                              isLive
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-green-500/50'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-purple-500/50'
                            }`}
                          >
                            {isLive ? '🔴 Join Now' : 'Join Session'}
                          </Link>
                        )}
                        {session.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="px-4 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-full text-xs font-medium transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
