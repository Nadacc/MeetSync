import React from 'react';

const Meeting = () => {
  return (
    <div className="bg-white shadow-md rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-2">Upcoming Meetings</h2>
      <ul className="list-disc list-inside text-gray-700">
        <li>Team Sync - 10:00 AM</li>
        <li>Project Kickoff - 2:00 PM</li>
        <li>Client Review - 4:30 PM</li>
      </ul>
    </div>
  );
};

export default Meeting;
