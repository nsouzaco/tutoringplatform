import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Welcome to TutorPlatform
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Connect with expert tutors for one-on-one video sessions. Learn, grow, and achieve your goals
        with personalized tutoring powered by AI insights.
      </p>

      <div className="flex justify-center space-x-4">
        {currentUser ? (
          <Link
            to="/dashboard"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Find Tutors</h3>
          <p className="text-gray-600">
            Browse available tutors and book sessions that fit your schedule
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold mb-2">Video Sessions</h3>
          <p className="text-gray-600">
            Real-time video, chat, and collaborative notes for effective learning
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
          <p className="text-gray-600">
            Tutors get AI-powered reports to track progress and improve teaching
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

