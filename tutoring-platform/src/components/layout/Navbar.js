import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  // Don't render navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  const textColor = isHomePage ? 'text-white' : 'text-black';
  const hoverColor = isHomePage ? 'hover:text-gray-200' : 'hover:text-gray-800';
  const roleBadgeBorder = isHomePage ? 'border-white/20' : 'border-black';
  const userBadgeBorder = isHomePage ? 'border-white/30' : 'border-black';

  const navbarContent = (
    <>
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <span className={`text-xl font-bold ${textColor}`}>SmartTutor</span>
        </Link>
        
        {/* Role Badge */}
        {currentUser && userData && (
          <span className={`px-3 py-1 bg-white/10 backdrop-blur-sm border ${roleBadgeBorder} rounded-full text-[10px] font-medium ${textColor} tracking-wider`}>
            {userData.role}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {currentUser && userData ? (
          <>
            <Link
              to="/dashboard"
              className={`${textColor} ${hoverColor} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
            >
              Dashboard
            </Link>
            
            {userData.role === 'TUTOR' && (
              <>
                <Link
                  to="/availability"
                  className={`${textColor} ${hoverColor} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Availability
                </Link>
                <Link
                  to="/past-sessions"
                  className={`${textColor} ${hoverColor} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Past Sessions
                </Link>
              </>
            )}
            
            {userData.role === 'STUDENT' && (
              <Link
                to="/tutors"
                className={`${textColor} ${hoverColor} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Find Tutors
              </Link>
            )}

            <div className="flex items-center space-x-3">
              <span className={`text-sm ${textColor} px-3 py-1.5 border ${userBadgeBorder} rounded-full bg-white/5 backdrop-blur-sm`}>
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
              className={`${textColor} ${hoverColor} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
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
    </>
  );

  return (
    <nav className="relative z-10 bg-transparent">
      {!isHomePage ? (
        <div className="bg-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 bg-purple-100 backdrop-blur-sm border border-purple-200 rounded-full px-6 gap-8">
              {navbarContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {navbarContent}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
