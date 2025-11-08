import React, { useState, useEffect } from 'react';
import { sessionsAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PastSessions = () => {
  const { userData } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  const isTutor = userData?.role === 'TUTOR';

  useEffect(() => {
    fetchPastSessions();
  }, []);

  const fetchPastSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.getSessions({ status: 'COMPLETED' });
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (err) {
      setError(err.message);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (sessionId) => {
    setGeneratingReport(sessionId);
    setError('');

    try {
      const data = await reportsAPI.generateReport(sessionId);
      alert('Report generated successfully!');
      // Optionally show the report
      setViewingReport(data.report);
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleViewReport = async (sessionId) => {
    setError('');
    try {
      const data = await reportsAPI.getReport(sessionId);
      if (!data.report) {
        setError('No report found for this session. Generate one first!');
        return;
      }
      setViewingReport(data.report);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No report found. Click "Generate AI Report" first!');
      } else {
        setError(`Failed to load report: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Past Sessions</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center">
            <p className="text-gray-600">No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
          {sessions.map((session) => {
            const otherUser = isTutor ? session.student : session.tutor;

            return (
              <div
                key={session.id}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      Session with {otherUser.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      📅 {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      🕒 {new Date(session.startTime).toLocaleTimeString()} ({session.duration} minutes)
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                      COMPLETED
                    </span>
                  </div>

                  {isTutor && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReport(session.id)}
                        disabled={generatingReport === session.id}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
                      >
                        {generatingReport === session.id ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </span>
                        ) : (
                          '🤖 Generate AI Report'
                        )}
                      </button>
                      <button
                        onClick={() => handleViewReport(session.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all text-sm"
                      >
                        📄 View Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}

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
              {/* Summary */}
              {viewingReport.reportData.summary && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{viewingReport.reportData.summary}</p>
                </div>
              )}

              {/* Topics Covered */}
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
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700">{viewingReport.reportData.topicsCovered}</p>
                  )}
                </div>
              )}

              {/* Student Progress */}
              {viewingReport.reportData.studentProgress && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Progress</h3>
                  <p className="text-gray-700">{viewingReport.reportData.studentProgress}</p>
                </div>
              )}

              {/* Strengths */}
              {viewingReport.reportData.strengths && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Strengths</h3>
                  {Array.isArray(viewingReport.reportData.strengths) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{viewingReport.reportData.strengths}</p>
                  )}
                </div>
              )}

              {/* Areas for Improvement */}
              {viewingReport.reportData.areasForImprovement && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                  {Array.isArray(viewingReport.reportData.areasForImprovement) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.areasForImprovement.map((area, index) => (
                        <li key={index} className="text-gray-700">
                          {area}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{viewingReport.reportData.areasForImprovement}</p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {viewingReport.reportData.recommendations && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                  {Array.isArray(viewingReport.reportData.recommendations) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-700">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{viewingReport.reportData.recommendations}</p>
                  )}
                </div>
              )}

              {/* Next Steps */}
              {viewingReport.reportData.nextSteps && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                  {Array.isArray(viewingReport.reportData.nextSteps) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {viewingReport.reportData.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-700">
                          {step}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{viewingReport.reportData.nextSteps}</p>
                  )}
                </div>
              )}

              {/* Raw Report Data (fallback if structure is different) */}
              {!viewingReport.reportData.summary && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Report</h3>
                  <pre className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {JSON.stringify(viewingReport.reportData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Report Metadata */}
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
    </div>
  );
};

export default PastSessions;

