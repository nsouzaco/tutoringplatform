import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorsAPI, sessionsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Search, User, Calendar, BookOpen, X, Check } from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Tutors = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration] = useState(30); // Fixed 30 minute sessions
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Generate available time slots for the next 7 days based on tutor availability
  const generateAvailableSlots = (tutor) => {
    const slots = [];
    const now = new Date();
    
    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      const dayOfWeek = date.getDay();
      
      // Find availability for this day
      const dayAvailability = tutor.availability.filter(
        (avail) => avail.dayOfWeek === dayOfWeek && avail.isEnabled
      );
      
      dayAvailability.forEach((avail) => {
        // Parse start and end times
        const [startHour, startMin] = avail.startTime.split(':').map(Number);
        const [endHour, endMin] = avail.endTime.split(':').map(Number);
        
        // Convert to total minutes for easier calculation
        const startTotalMinutes = startHour * 60 + (startMin || 0);
        const endTotalMinutes = endHour * 60 + (endMin || 0);
        
        // Create slots every 30 minutes
        for (let totalMinutes = startTotalMinutes; totalMinutes < endTotalMinutes; totalMinutes += 30) {
          const slotHour = Math.floor(totalMinutes / 60);
          const slotMin = totalMinutes % 60;
          
          const slotDate = new Date(date);
          slotDate.setHours(slotHour, slotMin, 0, 0);
          
          // Only show future slots
          if (slotDate > now) {
            slots.push({
              date: slotDate,
              dayName: DAYS_OF_WEEK[dayOfWeek],
              time: `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`,
            });
          }
        }
      });
    }
    
    return slots.sort((a, b) => a.date - b.date).slice(0, 20); // Show max 20 slots
  };

  const handleBookSession = async () => {
    if (!selectedSlot) return;
    
    setError('');

    try {
      await sessionsAPI.createSession({
        tutorId: selectedTutor.id,
        startTime: selectedSlot.date.toISOString(),
        duration: parseInt(duration),
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setSelectedSlot(null);
        setSelectedTutor(null);
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const openBookingModal = (tutor) => {
    setSelectedTutor(tutor);
    const slots = generateAvailableSlots(tutor);
    setAvailableSlots(slots);
    setShowBookingModal(true);
    setError('');
    setBookingSuccess(false);
    setSelectedSlot(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Find Tutors</h1>
          <p className="text-gray-600 mb-8">Browse available tutors and book your next learning session</p>
        </motion.div>

        {/* Search Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by subject (e.g., Math, Physics, Chemistry)..."
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </motion.div>

        {tutors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center"
          >
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {subjectFilter
                ? 'No tutors found matching your search.'
                : 'No tutors available at the moment.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tutors.map((tutor, index) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {tutor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{tutor.name}</h3>
                        {tutor.hourlyRate && (
                          <p className="text-purple-600 font-medium">${tutor.hourlyRate}/hour</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {tutor.bio && (
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{tutor.bio}</p>
                  )}

                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <p className="text-sm font-semibold text-gray-700">Subjects:</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {tutor.availability && tutor.availability.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-gray-700">Available:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(tutor.availability.map(a => a.dayOfWeek))].map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm"
                        >
                          {DAYS_OF_WEEK[day]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => openBookingModal(tutor)}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-gray-900/50"
                  >
                    Book Session
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedTutor && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Book Session</h2>
                  <p className="text-gray-600">with {selectedTutor.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedTutor(null);
                    setSelectedSlot(null);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="bg-green-50 border border-green-500 text-green-700 px-6 py-4 rounded-xl flex items-center space-x-3">
                  <Check className="h-5 w-5" />
                  <span>Session booked successfully! Redirecting...</span>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border border-red-500 text-red-700 px-6 py-4 rounded-xl mb-6">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Available Time Slots */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <label className="block text-gray-900 font-medium">
                          Select Available Time Slot
                        </label>
                      </div>
                      
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No available slots in the next 7 days. Please check back later.</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                          {availableSlots.map((slot, index) => {
                            const isSelected = selectedSlot?.date?.getTime() === slot.date.getTime();
                            return (
                              <button
                                key={index}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full p-4 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      {slot.dayName}, {slot.date.toLocaleDateString()}
                                    </p>
                                    <p className={`text-sm ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                      {slot.time}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBookingModal(false);
                          setSelectedTutor(null);
                          setSelectedSlot(null);
                          setError('');
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-medium transition-all shadow-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBookSession}
                        disabled={!selectedSlot}
                        className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tutors;
