import React, { useState, useEffect } from 'react';
import { availabilityAPI } from '../services/api';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Availability = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityAPI.getAvailability();
      setAvailability(data.availability);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await availabilityAPI.createAvailability(formData);
      setShowForm(false);
      setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' });
      fetchAvailability();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      await availabilityAPI.deleteAvailability(id);
      fetchAvailability();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      await availabilityAPI.updateAvailability(id, { isEnabled: !currentEnabled });
      fetchAvailability();
    } catch (err) {
      setError(err.message);
    }
  };

  // Group availability by day
  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg"
          >
            {showForm ? 'Cancel' : '+ Add Availability'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Add Availability Slot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full font-medium transition-all shadow-lg"
            >
              Add Availability
            </button>
          </form>
        </div>
      )}

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Availability</h2>

          {availability.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No availability slots set. Add your availability so students can book sessions with you!
            </p>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const slots = groupedAvailability[dayIndex] || [];
                if (slots.length === 0) return null;

                return (
                  <div key={dayIndex}>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{day}</h3>
                    <div className="space-y-2">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                slot.isEnabled
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {slot.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEnabled(slot.id, slot.isEnabled)}
                              className="px-4 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all"
                            >
                              {slot.isEnabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="px-4 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;

