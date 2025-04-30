import React from 'react';
import { useNavigate } from 'react-router-dom';

const MeetingEnded = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Meeting Ended</h1>
      <p className="mb-6">Thank you for joining the meeting.</p>
      <button
        onClick={() => navigate('/app/dashboard')}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default MeetingEnded;
