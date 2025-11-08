import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/session/ChatBox';

const SessionRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  useEffect(() => {
    if (session && jitsiContainerRef.current && !jitsiApiRef.current) {
      initializeJitsi();
    }

    // Cleanup on unmount
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [session]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await sessionsAPI.getSessionById(id);
      setSession(data.session);

      // Update session status to LIVE if it's scheduled
      if (data.session.status === 'SCHEDULED') {
        await sessionsAPI.updateSessionStatus(id, 'LIVE');
        setSession({ ...data.session, status: 'LIVE' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeJitsi = () => {
    if (!window.JitsiMeetExternalAPI) {
      // Load Jitsi script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => createJitsiMeet();
      document.body.appendChild(script);
    } else {
      createJitsiMeet();
    }
  };

  const createJitsiMeet = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: session.jitsiRoomId,
      width: '100%',
      height: 600,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userData.name,
        email: userData.email,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'tileview',
        ],
      },
    };

    jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    // Handle when user leaves the meeting
    jitsiApiRef.current.addEventListener('readyToClose', handleEndSession);
  };

  const handleEndSession = async () => {
    try {
      await sessionsAPI.updateSessionStatus(id, 'COMPLETED');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error ending session:', err);
      navigate('/dashboard');
    }
  };

  const handleLeaveSession = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
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
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
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
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Leave Session
          </button>
        </div>
      </div>

      {/* Main Content: Video + Chat */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Jitsi Video Container */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div ref={jitsiContainerRef} />
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
              <span className="font-medium">Room ID:</span> {session.jitsiRoomId}
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
    </div>
  );
};

export default SessionRoom;

