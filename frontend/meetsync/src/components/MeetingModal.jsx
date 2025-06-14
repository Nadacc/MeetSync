import React, { useState } from 'react';
import { CalendarDays, MapPin, Video, Clock, Users, X, Edit2, Trash2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMeeting } from '../features/meetingSlice';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import socket from '../socket';
import axiosInstance from '../api/axiosInstance';
import { createMeetingCall } from '../features/streamSlice';
import PreMeetingModal from './PreMeetingModal';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const suffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  const options = { month: 'long', year: 'numeric' };
  return `${day}${suffix(day)} ${date.toLocaleDateString('en-US', options)}`;
};

const formatTime = (dateString, fromZone, toZone) => {
  const safeFromZone = fromZone || 'UTC';
  const safeToZone = toZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return DateTime
    .fromISO(dateString, { zone: safeFromZone })
    .setZone(safeToZone)
    .toFormat('hh:mm a');
};

const MeetingModal = ({ meeting, onClose, isMyMeeting, userTimezone, onEdit }) => {
  const [showPreMeetingModal, setShowPreMeetingModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const isPastMeeting = new Date(meeting.endTime) < new Date();

  const handleDelete = () => {
    const confirm = window.confirm('Are you sure you want to cancel this meeting?');
    if (confirm) {
      dispatch(deleteMeeting(meeting._id))
        .unwrap()
        .then(() => {
          const attendeesEmails = meeting.attendees.map((attendee) => attendee.email);

          const attendeePromises = attendeesEmails.map(async (email) => {
            try {
              const res = await axiosInstance.get(`/users/check-email?email=${email}`);
              if (res.status === 200 && res.data.exists) {
                return res.data.userId;
              }
            } catch (error) {
              console.error("Error fetching user ID for email:", email, error);
            }
          });

          Promise.all(attendeePromises).then((attendeeIds) => {
            attendeeIds.forEach((receiverId) => {
              if (receiverId) {
                const notification = {
                  title: 'Meeting Canceled',
                  message: `The meeting "${meeting.title}" has been canceled by the organizer.`,
                };

                socket.emit('send_notification', {
                  receiverId,
                  notification,
                });
              }
            });
          });

          onClose();
        })
        .catch((err) => alert(`Failed to cancel: ${err}`));
    }
  };

  const handleEdit = () => {
    onEdit(meeting);
    navigate('/app/create-meeting', { state: { meeting } });
    onClose();
  };

  const { currentCall } = useSelector((state) => state.stream);

  const handleJoinMeeting = async () => {
    if (!user || !user._id || !meeting?._id) {
      console.error('Missing userId or meetingId');
      return;
    }

    const currentTime = new Date();
    const meetingStartTime = new Date(meeting.startTime);

    if (currentTime < meetingStartTime) {
      setShowPreMeetingModal(true); 
      return;
    }

    if (currentCall && currentCall.callId === meeting._id && currentCall.participants?.includes(user._id)) {
      navigate(`/call/${currentCall.callId}`);
      return;
    }

    try {
      const response = await dispatch(createMeetingCall({
        userId: user._id,
        meetingId: meeting._id,
        title: meeting.title || '',
      })).unwrap();

      const callId = response.callId;
      if (callId) {
        navigate(`/call/${callId}`);
      } else {
        console.error('Missing callId in response');
      }
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  const formatAttendees = (attendees) => {
    if (Array.isArray(attendees)) {
      return attendees.map((attendee) => attendee.name || attendee).join(', ');
    }
    return '';
  };

  if (showPreMeetingModal) {
    return (
      <PreMeetingModal 
        startTime={meeting.startTime} 
        userTimezone={userTimezone} 
        onClose={() => setShowPreMeetingModal(false)} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">{meeting.title}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                meeting.type === 'online' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {meeting.type === 'online' ? 'Online Meeting' : 'In-Person Meeting'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Meeting Details */}
          <div className="space-y-4">
            {meeting.agenda && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Agenda</h3>
                <p className="text-gray-700">{meeting.agenda}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-700">{formatDate(meeting.startTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="text-gray-700">
                    {formatTime(meeting.startTime, meeting.timezone, userTimezone)} - {' '}
                    {formatTime(meeting.endTime, meeting.timezone, userTimezone)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                  {meeting.type === 'online' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    {meeting.type === 'online' ? 'Meeting Type' : 'Location'}
                  </h3>
                  <p className="text-gray-700">
                    {meeting.type === 'online' ? 'Video Conference' : meeting.location}
                  </p>
                </div>
              </div>

              {meeting.organizer?.name && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Organizer</h3>
                    <p className="text-gray-700">{meeting.organizer.name}</p>
                  </div>
                </div>
              )}
            </div>

            {isMyMeeting && meeting.attendees?.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Attendees</h3>
                  <p className="text-gray-700">{formatAttendees(meeting.attendees)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {meeting.type === 'online' && !isPastMeeting && (
              <Button
                onClick={handleJoinMeeting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Join Meeting
              </Button>
            )}

            {isMyMeeting && !isPastMeeting && (
              <div className="flex gap-3">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="w-full py-3 border-blue-500 text-white bg-yellow-500 hover:bg-yellow-700 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full py-3 border-red-500 text-white bg-red-500 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;