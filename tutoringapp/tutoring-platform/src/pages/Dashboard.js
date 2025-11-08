import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { userData } = useAuth();

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {userData.name}!
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {userData.email}</p>
            <p><span className="font-medium">Role:</span> {userData.role}</p>
            <p><span className="font-medium">Timezone:</span> {userData.timezone}</p>
            
            {userData.role === 'TUTOR' && userData.tutorProfile && (
              <>
                {userData.tutorProfile.subjects && userData.tutorProfile.subjects.length > 0 && (
                  <p>
                    <span className="font-medium">Subjects:</span>{' '}
                    {userData.tutorProfile.subjects.join(', ')}
                  </p>
                )}
                {userData.tutorProfile.bio && (
                  <p>
                    <span className="font-medium">Bio:</span> {userData.tutorProfile.bio}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {userData.role === 'TUTOR' ? 'Upcoming Sessions' : 'Your Sessions'}
          </h2>
          <p className="text-gray-600">No sessions scheduled yet.</p>
        </div>
      </div>

      {userData.role === 'TUTOR' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            💡 <strong>Next step:</strong> Set up your availability so students can book sessions with you!
          </p>
        </div>
      )}

      {userData.role === 'STUDENT' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            💡 <strong>Next step:</strong> Browse available tutors and book your first session!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

