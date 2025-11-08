import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../services/api';

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
    return <div>Loading...</div>;
  }

  const isTutor = userData.role === 'TUTOR';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {userData.name}!</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {userData.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {userData.role}
            </p>
            <p>
              <span className="font-medium">Timezone:</span> {userData.timezone}
            </p>
            {isTutor && userData.tutorProfile && (
              <>
                {userData.tutorProfile.subjects && userData.tutorProfile.subjects.length > 0 && (
                  <p>
                    <span className="font-medium">Subjects:</span> {userData.tutorProfile.subjects.join(', ')}
                  </p>
                )}
                {userData.tutorProfile.bio && (
                  <p>
                    <span className="font-medium">Bio:</span> {userData.tutorProfile.bio}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {isTutor ? (
              <>
                <Link
                  to="/availability"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-center font-medium"
                >
                  Manage Availability
                </Link>
                <p className="text-sm text-gray-600 mt-2">
                  Set your availability so students can book sessions
                </p>
              </>
            ) : (
              <>
                <Link
                  to="/tutors"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-center font-medium"
                >
                  Find Tutors
                </Link>
                <p className="text-sm text-gray-600 mt-2">
                  Browse available tutors and book a session
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions scheduled.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const otherUser = isTutor ? session.student : session.tutor;
              const isLive = session.status === 'LIVE';
              const canJoin = new Date(session.startTime) <= new Date();

              return (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Session with {otherUser.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isLive
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        📅 {new Date(session.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        🕒 {new Date(session.startTime).toLocaleTimeString()} ({session.duration} minutes)
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {canJoin && session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && (
                        <Link
                          to={`/session/${session.id}`}
                          className={`px-4 py-2 rounded-md font-medium ${
                            isLive
                              ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          {isLive ? 'Join Now' : 'Join Session'}
                        </Link>
                      )}
                      {session.status === 'SCHEDULED' && !isLive && (
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
