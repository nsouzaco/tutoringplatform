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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              TutorPlatform
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && userData ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {userData.role === 'TUTOR' && (
                  <Link
                    to="/availability"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Availability
                  </Link>
                )}
                
                {userData.role === 'STUDENT' && (
                  <Link
                    to="/tutors"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Find Tutors
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {userData.name} ({userData.role})
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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

