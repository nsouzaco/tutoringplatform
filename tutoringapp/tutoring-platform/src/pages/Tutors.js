import React, { useState, useEffect } from 'react';
import { tutorsAPI, sessionsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: 60,
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, [subjectFilter]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const data = await tutorsAPI.getTutors(subjectFilter);
      setTutors(data.tutors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Combine date and time into ISO string
      const startTime = new Date(`${bookingData.date}T${bookingData.time}`).toISOString();

      await sessionsAPI.createSession({
        tutorId: selectedTutor.id,
        startTime,
        duration: parseInt(bookingData.duration),
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setBookingData({ date: '', time: '', duration: 60 });
        setSelectedTutor(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openBookingModal = (tutor) => {
    setSelectedTutor(tutor);
    setShowBookingModal(true);
    setError('');
    setBookingSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Find Tutors</h1>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="Filter by subject (e.g., Math, Physics, Chemistry)..."
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      {tutors.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">
            {subjectFilter
              ? 'No tutors found matching your search.'
              : 'No tutors available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {tutor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{tutor.name}</h3>
                    {tutor.hourlyRate && (
                      <p className="text-gray-600">${tutor.hourlyRate}/hour</p>
                    )}
                  </div>
                </div>
              </div>

              {tutor.bio && (
                <p className="text-gray-700 mb-4">{tutor.bio}</p>
              )}

              {tutor.subjects && tutor.subjects.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tutor.availability && tutor.availability.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Available:</p>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(tutor.availability.map(a => a.dayOfWeek))].map((day) => (
                      <span
                        key={day}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                      >
                        {DAYS_OF_WEEK[day]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => openBookingModal(tutor)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Book Session with {selectedTutor.name}</h2>

            {bookingSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                ✅ Session booked successfully! Redirecting...
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleBookSession} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Duration</label>
                    <select
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingModal(false);
                        setSelectedTutor(null);
                        setError('');
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutors;

