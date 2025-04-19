import React, { useEffect, useState } from 'react';
import Header from './ui/Header';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings } from '../features/meetingSlice';
import MeetingCard from './MeetingCard';
import MeetingModal from './MeetingModal';
import { DateTime } from 'luxon';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { created, invited, loading, error } = useSelector((state) => state.meeting);
  const userTimezone = useSelector((state) => state.auth.user?.timezone);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [formMode, setFormMode] = useState(null); // "edit" or null
  const [editingMeeting, setEditingMeeting] = useState(null);

  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);

  const closeModal = () => setSelectedMeeting(null);

  const isSameDay = (isoString) => {
    if (!selectedDate) return true;
    const meetingDate = DateTime.fromISO(isoString, { zone: userTimezone }).toISODate();
    return meetingDate === selectedDate;
  };

  const filteredCreated = created.filter((m) => isSameDay(m.startTime));
  const filteredInvited = invited.filter((m) => isSameDay(m.startTime));

  const handleEdit = (meeting) => {
    setFormMode('edit');
    setEditingMeeting(meeting); 
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Date Picker */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* My Meetings */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Meetings</h2>
          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCreated.length === 0 ? (
              <div className="col-span-full text-gray-500">No meetings found for the selected date.</div>
            ) : (
              filteredCreated.map((meeting) => (
                <MeetingCard
                  key={meeting._id}
                  meeting={meeting}
                  onClick={setSelectedMeeting}
                />
              ))
            )}
          </div>
        </section>

        {/* Invited Meetings */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invited Meetings</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvited.length === 0 ? (
              <div className="col-span-full text-gray-500">No invited meetings found for the selected date.</div>
            ) : (
              filteredInvited.map((meeting) => (
                <MeetingCard
                  key={meeting._id}
                  meeting={meeting}
                  showOrganizer
                  onClick={setSelectedMeeting}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Meeting Modal */}
      {selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          onClose={closeModal}
          isMyMeeting={created.some((m) => m._id === selectedMeeting._id)}
          userTimezone={userTimezone}
          onEdit={handleEdit} 
        />
      )}
    </div>
  );
};


export default Dashboard;
