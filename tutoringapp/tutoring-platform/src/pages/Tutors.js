import React, { useState, useEffect } from 'react';
import { tutorsAPI, sessionsAPI } from '../services/api';
import { motion } from 'framer-motion';
import { Search, User, Calendar, BookOpen, Clock, X, Check } from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(60);
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
        const [endHour] = avail.endTime.split(':').map(Number);
        
        // Create slots every hour
        for (let hour = startHour; hour < endHour; hour++) {
          const slotDate = new Date(date);
          slotDate.setHours(hour, startMin || 0, 0, 0);
          
          // Only show future slots
          if (slotDate > now) {
            slots.push({
              date: slotDate,
              dayName: DAYS_OF_WEEK[dayOfWeek],
              time: `${String(hour).padStart(2, '0')}:${String(startMin || 0).padStart(2, '0')}`,
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
        setDuration(60);
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
                className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-purple-500/50 transition-all group flex flex-col"
              >
                <div className="flex-grow">
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
                </div>

                <button
                  onClick={() => openBookingModal(tutor)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-purple-500/50 mt-4"
                >
                  Book Session
                </button>
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
              className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full my-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Book Session</h2>
                  <p className="text-gray-400">with {selectedTutor.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedTutor(null);
                    setSelectedSlot(null);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-xl flex items-center space-x-3">
                  <Check className="h-5 w-5" />
                  <span>Session booked successfully! Redirecting...</span>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Duration Selector */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <label className="block text-white font-medium">Session Duration</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[15, 30, 45, 60].map((min) => (
                          <button
                            key={min}
                            onClick={() => setDuration(min)}
                            className={`py-3 px-4 rounded-xl font-medium transition-all ${
                              duration === min
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                            }`}
                          >
                            {min} min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Available Time Slots */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <label className="block text-white font-medium">
                          Select Available Time Slot
                        </label>
                      </div>
                      
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                          <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No available slots in the next 7 days. Please check back later.</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                          {availableSlots.map((slot, index) => {
                            const isSelected = selectedSlot?.date?.getTime() === slot.date.getTime();
                            return (
                              <button
                                key={index}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full p-4 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      {slot.dayName}, {slot.date.toLocaleDateString()}
                                    </p>
                                    <p className={`text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
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
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-full font-medium transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBookSession}
                        disabled={!selectedSlot}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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
