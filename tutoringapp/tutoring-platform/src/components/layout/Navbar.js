import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <nav className="relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">TutorPlatform</span>
            </Link>
            
            {/* Role Badge */}
            {currentUser && userData && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[10px] font-medium text-white/80 tracking-wider">
                {userData.role}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && userData ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                
                {userData.role === 'TUTOR' && (
                  <>
                    <Link
                      to="/availability"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Availability
                    </Link>
                    <Link
                      to="/past-sessions"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Past Sessions
                    </Link>
                  </>
                )}
                
                {userData.role === 'STUDENT' && (
                  <Link
                    to="/tutors"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Find Tutors
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-white px-3 py-1.5 border border-white/30 rounded-full bg-white/5 backdrop-blur-sm">
                    {userData.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-full text-sm font-medium transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
