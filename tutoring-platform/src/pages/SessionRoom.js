import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/session/ChatBox';
import RatingModal from '../components/session/RatingModal';
import DailyIframe from '@daily-co/daily-js';

const SessionRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [dailyToken, setDailyToken] = useState(null);
  const [dailyRoomUrl, setDailyRoomUrl] = useState(null);
  const dailyCallRef = useRef(null);
  const dailyContainerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.getSessionById(id);
      
      // Check if session is completed or cancelled - can't join
      if (data.session.status === 'COMPLETED' || data.session.status === 'CANCELLED') {
        setError('This session has ended and cannot be rejoined.');
        setLoading(false);
        return;
      }

      setSession(data.session);

      // Update session status to LIVE if it's scheduled
      if (data.session.status === 'SCHEDULED') {
        await sessionsAPI.updateSessionStatus(id, 'LIVE');
        setSession({ ...data.session, status: 'LIVE' });
      }

      // Get Daily.co meeting token
      if (data.session.dailyRoomUrl) {
        try {
          console.log('Fetching Daily.co meeting token...');
          const tokenData = await sessionsAPI.getMeetingToken(id);
          console.log('Daily.co token received:', { hasToken: !!tokenData.token, hasUrl: !!tokenData.roomUrl });
          setDailyToken(tokenData.token);
          setDailyRoomUrl(tokenData.roomUrl);
        } catch (err) {
          console.error('Failed to get meeting token:', err);
          setError(`Failed to initialize video room: ${err.message}. Please try again.`);
        }
      } else {
        console.warn('Session does not have dailyRoomUrl');
        setError('Video room not set up for this session.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    // Reset initialization flag when session ID changes
    if (session?.id) {
      hasInitializedRef.current = false;
    }
  }, [session?.id]);

  const handleEndSession = useCallback(async () => {
    try {
      // Clean up Daily.co call FIRST before updating session status
      if (dailyCallRef.current) {
        try {
          dailyCallRef.current.leave();
          dailyCallRef.current.destroy();
        } catch (err) {
          console.warn('Error cleaning up Daily.co call:', err);
        }
        dailyCallRef.current = null;
      }
      
      // Clear the container to prevent duplicate instances
      if (dailyContainerRef.current) {
        dailyContainerRef.current.innerHTML = '';
      }
      
      // Reset flags BEFORE updating session status
      hasInitializedRef.current = false;
      isInitializingRef.current = false;

      // Update session status to COMPLETED
      await sessionsAPI.updateSessionStatus(id, 'COMPLETED');
      
      // Update local session state
      setSession((prevSession) => prevSession ? { ...prevSession, status: 'COMPLETED' } : null);

      // Clear Daily.co URLs to prevent re-initialization
      setDailyRoomUrl(null);
      setDailyToken(null);

      // If student is leaving, show rating modal
      if (userData.role === 'STUDENT') {
        setShowRatingModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session. Please try again.');
    }
  }, [id, userData, navigate]);

  const initializeDaily = useCallback(async () => {
    if (!dailyRoomUrl || !dailyToken || !dailyContainerRef.current) {
      return;
    }

    // Don't initialize if already initialized or initializing
    if (dailyCallRef.current || isInitializingRef.current || hasInitializedRef.current) {
      console.log('Skipping Daily.co initialization - already initialized or in progress');
      return;
    }

    // Clean up any existing instance first
    if (dailyCallRef.current) {
      try {
        dailyCallRef.current.leave();
        dailyCallRef.current.destroy();
      } catch (err) {
        console.warn('Error cleaning up existing Daily.co instance:', err);
      }
      dailyCallRef.current = null;
    }

    // Clear the container
    if (dailyContainerRef.current) {
      dailyContainerRef.current.innerHTML = '';
    }

    isInitializingRef.current = true;

    try {
      console.log('Initializing Daily.co...');
      
      // Create Daily call instance
      const call = DailyIframe.createFrame(dailyContainerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '0',
        },
      });

      // Join the call
      await call.join({
        url: dailyRoomUrl,
        token: dailyToken,
        userName: userData.name,
      });

      dailyCallRef.current = call;
      hasInitializedRef.current = true;
      isInitializingRef.current = false;

      console.log('Daily.co initialized successfully');

      // Handle when user leaves
      call.on('left-meeting', handleEndSession);

      // Handle errors
      call.on('error', (error) => {
        console.error('Daily.co error:', error);
        setError('Video connection error. Please try refreshing.');
      });
    } catch (err) {
      console.error('Failed to initialize Daily.co:', err);
      setError(`Failed to start video: ${err.message}`);
      isInitializingRef.current = false;
      hasInitializedRef.current = false;
      
      // Clean up on error
      if (dailyCallRef.current) {
        try {
          dailyCallRef.current.leave();
          dailyCallRef.current.destroy();
        } catch (cleanupErr) {
          console.warn('Error cleaning up after failed initialization:', cleanupErr);
        }
        dailyCallRef.current = null;
      }
    }
  }, [dailyRoomUrl, dailyToken, userData, handleEndSession]);

  useEffect(() => {
    // Don't initialize if session is completed or cancelled
    if (session?.status === 'COMPLETED' || session?.status === 'CANCELLED') {
      return;
    }

    // Wait a bit for the container to be rendered
    if (session && dailyRoomUrl && dailyToken && !dailyCallRef.current && !isInitializingRef.current && !hasInitializedRef.current) {
      // Small delay to ensure container is fully rendered
      const timer = setTimeout(() => {
        if (dailyContainerRef.current && !dailyCallRef.current && !isInitializingRef.current) {
          initializeDaily();
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }

    // Cleanup on unmount or when session changes
    return () => {
      if (dailyCallRef.current) {
        try {
          dailyCallRef.current.leave();
          dailyCallRef.current.destroy();
        } catch (err) {
          console.warn('Error cleaning up Daily.co call:', err);
        }
        dailyCallRef.current = null;
        hasInitializedRef.current = false;
        isInitializingRef.current = false;
      }
    };
  }, [session, dailyRoomUrl, dailyToken, initializeDaily]);

  const handleLeaveSession = async () => {
    // handleEndSession will clean up Daily.co, so we just call it
    await handleEndSession();
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    navigate('/dashboard');
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Session not found'}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-purple-500/50"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isTutor = userData.role === 'TUTOR';
  const otherUser = isTutor ? session.student : session.tutor;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Session with {otherUser.name}</h1>
            <p className="text-gray-600">
              {new Date(session.startTime).toLocaleString()} ({session.duration} minutes)
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                session.status === 'LIVE'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'SCHEDULED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {session.status}
            </span>
          </div>
          <button
            onClick={handleLeaveSession}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-red-500/50"
          >
            {isTutor ? 'End Session' : 'Leave Session'}
          </button>
        </div>
      </div>

      {/* Main Content: Video + Chat */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Daily.co Video Container */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px', position: 'relative' }}>
            {dailyRoomUrl && dailyToken ? (
              <div ref={dailyContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Connecting to video room...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="lg:col-span-1">
          <div style={{ height: '600px' }}>
            <ChatBox sessionId={session.id} />
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Session Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Room:</span> {session.dailyRoomName || session.jitsiRoomId || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span> {session.duration} minutes
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium">{isTutor ? 'Student' : 'Tutor'}:</span> {otherUser.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {otherUser.email}
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> All chat messages are automatically saved to the database. 
            After the session, tutors can generate an AI analysis report based on the conversation.
          </p>
        </div>
      </div>

      {/* Rating Modal (for students only) */}
      {showRatingModal && (
        <RatingModal
          sessionId={id}
          onClose={handleRatingClose}
          onSubmitSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default SessionRoom;
