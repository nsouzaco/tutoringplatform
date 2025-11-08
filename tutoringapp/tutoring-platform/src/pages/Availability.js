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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Availability</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium"
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Availability Slot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md font-medium"
            >
              Add Availability
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Current Availability</h2>

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
                  <h3 className="font-semibold text-lg mb-2">{day}</h3>
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              slot.isEnabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {slot.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleEnabled(slot.id, slot.isEnabled)}
                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                          >
                            {slot.isEnabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
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
  );
};

export default Availability;

