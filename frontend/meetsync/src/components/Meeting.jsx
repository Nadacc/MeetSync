import React, { useEffect, useState } from 'react';
import Header from '../components/ui/Header';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings, clearRefreshNeeded } from '../features/meetingSlice';
import MeetingCard from '../components/MeetingCard';
import MeetingModal from '../components/MeetingModal';
import { Video, Calendar, Users, Clock, Loader2 } from 'lucide-react';

const Meeting = () => {
  const dispatch = useDispatch();
  const { created, invited, loading, error, refreshNeeded } = useSelector((state) => state.meeting);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header title="Online Meetings" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Created Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{onlineCreated.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Video className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invited Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{onlineInvited.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...onlineCreated, ...onlineInvited].filter(m => 
                    new Date(m.startTime) > new Date()
                  ).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* My Online Meetings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Video className="w-5 h-5 mr-2 text-blue-600" />
                My Online Meetings
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {onlineCreated.length} meeting{onlineCreated.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 font-medium">Error: {error}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {onlineCreated.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <Video className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">No online meetings created yet</h3>
                  <p className="mt-1 text-sm text-gray-400">Create your first online meeting to get started</p>
                </div>
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
          </div>
        </div>

        {/* Invited Online Meetings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Invited Online Meetings
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {onlineInvited.length} meeting{onlineInvited.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {onlineInvited.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                    <Users className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-500">No invited meetings</h3>
                  <p className="mt-1 text-sm text-gray-400">You'll see online meetings you're invited to here</p>
                </div>
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