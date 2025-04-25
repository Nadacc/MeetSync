import React, { useEffect, useState } from 'react';
import Header from '../components/ui/Header';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings,clearRefreshNeeded } from '../features/meetingSlice';
import MeetingCard from '../components/MeetingCard';
import MeetingModal from '../components/MeetingModal';

const Meeting = () => {
  const dispatch = useDispatch();
  const { created, invited, loading, error,refreshNeeded } = useSelector((state) => state.meeting);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const userTimezone = useSelector((state) => state.auth.user?.timezone);
  const [formMode, setFormMode] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);


  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);


  useEffect(() => {
    if (refreshNeeded) {
      dispatch(fetchMeetings());
      dispatch(clearRefreshNeeded());
    }
  }, [refreshNeeded, dispatch]);

  
  const onlineCreated = created.filter((meeting) => meeting.type === 'online');
  const onlineInvited = invited.filter((meeting) => meeting.type === 'online');

  const closeModal = () => setSelectedMeeting(null);
  const handleEdit = (meeting) => {
    setFormMode("edit");
    setEditingMeeting(meeting);
  };
  return (
    <div className="w-full">
      <Header title="Online Meetings" />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">My Online Meetings</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {onlineCreated.length === 0 ? (
            <p>No online meetings created yet.</p>
          ) : (
            onlineCreated.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                onClick={setSelectedMeeting}
              />
            ))
          )}
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Invited Online Meetings</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {onlineInvited.length === 0 ? (
            <p>You haven't been invited to any online meetings yet.</p>
          ) : (
            onlineInvited.map((meeting) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                showOrganizer
                onClick={setSelectedMeeting}
              />
            ))
          )}
        </div>
      </div>

      {selectedMeeting && (
        <MeetingModal 
          meeting={selectedMeeting} 
          onClose={closeModal} 
          isMyMeeting={onlineCreated.some((m) => m._id === selectedMeeting._id)} 
          userTimezone={userTimezone}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Meeting;
