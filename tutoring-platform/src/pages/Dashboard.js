import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI, reportsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, User, Mail, Globe, BookOpen, ArrowRight, AlertCircle, Video, Clock, Phone, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [sessionReports, setSessionReports] = useState({}); // Track which sessions have reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (userData && userData.role === 'ADMIN') {
      navigate('/admin');
      return;
    }
    
    fetchSessions();
    fetchPastSessions();
  }, [userData, navigate]);

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

  const fetchPastSessions = async () => {
    try {
      const data = await sessionsAPI.getSessions({ status: 'COMPLETED' });
      const completedSessions = Array.isArray(data.sessions) ? data.sessions : [];
      setPastSessions(completedSessions);

      // Check which sessions have reports
      const reportsStatus = {};
      for (const session of completedSessions) {
        try {
          await reportsAPI.getReport(session.id);
          reportsStatus[session.id] = true;
        } catch (err) {
          reportsStatus[session.id] = false;
        }
      }
      setSessionReports(reportsStatus);
    } catch (err) {
      console.error('Error fetching past sessions:', err);
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

  const handleGenerateReport = async (sessionId) => {
    setGeneratingReport(sessionId);
    setError('');

    try {
      // Start report generation
      const response = await reportsAPI.generateReport(sessionId);
      
      // If report already exists, show it immediately
      if (response.status === 'completed' && response.report) {
        setSessionReports({ ...sessionReports, [sessionId]: true });
        setViewingReport(response.report);
        setGeneratingReport(null);
        return;
      }
      
      // Otherwise, poll for completion
      const checkStatus = async () => {
        try {
          const statusData = await reportsAPI.getReportStatus(sessionId);
          
          if (statusData.status === 'completed') {
            // Report is ready, fetch it
            const reportData = await reportsAPI.getReport(sessionId);
            setSessionReports({ ...sessionReports, [sessionId]: true });
            setViewingReport(reportData.report);
            setGeneratingReport(null);
          } else if (statusData.status === 'failed') {
            setError('Report generation failed. Please try again.');
            setGeneratingReport(null);
          } else {
            // Still processing, check again in 2 seconds
            setTimeout(checkStatus, 2000);
          }
        } catch (err) {
          setError(`Failed to check report status: ${err.message}`);
          setGeneratingReport(null);
        }
      };
      
      // Start polling
      setTimeout(checkStatus, 2000);
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
      setGeneratingReport(null);
    }
  };

  const handleViewReport = async (sessionId) => {
    setError('');
    try {
      const data = await reportsAPI.getReport(sessionId);
      if (!data.report) {
        setError('No report found for this session.');
        return;
      }
      setViewingReport(data.report);
    } catch (err) {
      setError(`Failed to load report: ${err.message}`);
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
            Welcome back, {userData.name}!
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
                            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-md bg-green-500 hover:bg-green-600 text-white"
                          >
                            {isLive ? 'Join Now' : 'Join Session'}
                          </Link>
                        )}
                        {(session.status === 'SCHEDULED' || session.status === 'LIVE') && (
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-medium transition-all shadow-md"
                          >
                            Cancel Session
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

        {/* Past Sessions (for tutors only) - Full Width */}
        {userData.role === 'TUTOR' && pastSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm mt-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Past Sessions</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pastSessions.slice(0, 8).map((session) => {
                  const otherUser = session.student;
                  const hasReport = sessionReports[session.id];

                  return (
                    <div
                      key={session.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2">
                          Session with {otherUser.name}
                        </h3>
                        <div className="flex flex-col gap-2 text-xs text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(session.startTime).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(session.startTime).toLocaleTimeString()} ({session.duration} min)</span>
                          </span>
                        </div>
                        <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-medium">
                          COMPLETED
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {!hasReport ? (
                          <button
                            onClick={() => handleGenerateReport(session.id)}
                            disabled={generatingReport === session.id}
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
                          >
                            {generatingReport === session.id ? (
                              <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                              </span>
                            ) : (
                              'Generate AI Report'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewReport(session.id)}
                            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all text-sm"
                          >
                            View Report
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {pastSessions.length > 8 && (
                <Link
                  to="/past-sessions"
                  className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium"
                >
                  View all past sessions
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              )}
            </motion.div>
          )}
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">AI Session Report</h2>
              <button
                onClick={() => setViewingReport(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {viewingReport.reportData.summary && typeof viewingReport.reportData.summary === 'string' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{viewingReport.reportData.summary}</p>
                </div>
              )}

              {viewingReport.reportData.topicsCovered && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Topics Covered</h3>
                  {Array.isArray(viewingReport.reportData.topicsCovered) ? (
                    <div className="flex flex-wrap gap-2">
                      {viewingReport.reportData.topicsCovered.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {typeof topic === 'string' ? topic : JSON.stringify(topic)}
                        </span>
                      ))}
                    </div>
                  ) : typeof viewingReport.reportData.topicsCovered === 'string' ? (
                    <p className="text-gray-700">{viewingReport.reportData.topicsCovered}</p>
                  ) : null}
                </div>
              )}

              {viewingReport.reportData.studentProgress && typeof viewingReport.reportData.studentProgress === 'string' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Progress</h3>
                  <p className="text-gray-700">{viewingReport.reportData.studentProgress}</p>
                </div>
              )}

              {viewingReport.reportData.strengths && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Strengths</h3>
                  {Array.isArray(viewingReport.reportData.strengths) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">
                          {typeof strength === 'string' ? strength : JSON.stringify(strength)}
                        </li>
                      ))}
                    </ul>
                  ) : typeof viewingReport.reportData.strengths === 'string' ? (
                    <p className="text-gray-700">{viewingReport.reportData.strengths}</p>
                  ) : null}
                </div>
              )}

              {viewingReport.reportData.areasForImprovement && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                  {Array.isArray(viewingReport.reportData.areasForImprovement) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.areasForImprovement.map((area, index) => (
                        <li key={index} className="text-gray-700">
                          {typeof area === 'string' ? area : JSON.stringify(area)}
                        </li>
                      ))}
                    </ul>
                  ) : typeof viewingReport.reportData.areasForImprovement === 'string' ? (
                    <p className="text-gray-700">{viewingReport.reportData.areasForImprovement}</p>
                  ) : null}
                </div>
              )}

              {viewingReport.reportData.recommendations && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                  {Array.isArray(viewingReport.reportData.recommendations) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-700">
                          {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                        </li>
                      ))}
                    </ul>
                  ) : typeof viewingReport.reportData.recommendations === 'string' ? (
                    <p className="text-gray-700">{viewingReport.reportData.recommendations}</p>
                  ) : null}
                </div>
              )}

              {viewingReport.reportData.nextSteps && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                  {Array.isArray(viewingReport.reportData.nextSteps) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-700">
                          {typeof step === 'string' ? step : JSON.stringify(step)}
                        </li>
                      ))}
                    </ul>
                  ) : typeof viewingReport.reportData.nextSteps === 'string' ? (
                    <p className="text-gray-700">{viewingReport.reportData.nextSteps}</p>
                  ) : null}
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Generated: {new Date(viewingReport.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
