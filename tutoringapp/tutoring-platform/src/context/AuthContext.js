import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      setUserData(response.user);
      return response.user;
    } catch (err) {
      // If token is invalid/expired, silently sign out
      if (err.message.includes('Invalid or expired token') || err.message.includes('Unauthorized')) {
        await firebaseSignOut(auth);
        setCurrentUser(null);
        setUserData(null);
        return null;
      }
      // For other errors, log them
      console.error('Error fetching user data:', err);
      setError(err.message);
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, name, role, additionalData = {}) => {
    try {
      setError(null);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Register user in backend
      const registrationData = {
        firebaseUid: firebaseUser.uid,
        email,
        name,
        role,
        ...additionalData,
      };

      await authAPI.register(registrationData);
      
      // Fetch complete user data
      await fetchUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      
      // Explicitly fetch user data before returning
      // This ensures userData is available before navigation
      await fetchUserData();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, fetch user data from backend
        await fetchUserData();
      } else {
        // User is signed out
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshUserData: fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

