import React from 'react';
import { CalendarDays, MapPin, Video, Clock, Users,X } from 'lucide-react';
import { DateTime } from 'luxon';
import { useDispatch } from 'react-redux';
import { deleteMeeting } from '../features/meetingSlice';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import socket from '../socket';
import axiosInstance from '../api/axiosInstance';

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
  console.log("MeetingModal received meeting:", meeting);
  if (!meeting) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleDelete = () => {
    const confirm = window.confirm('Are you sure you want to cancel this meeting?');
    if (confirm) {
      dispatch(deleteMeeting(meeting._id))
        .unwrap()
        .then(() => {
          // After successfully deleting, notify all attendees
          const attendeesEmails = meeting.attendees.map((attendee) => attendee.email);
          
          // Fetch user IDs of attendees (assuming you have a function for this)
          const attendeePromises = attendeesEmails.map(async (email) => {
            try {
              const res = await axiosInstance.get(`/users/check-email?email=${email}`);
              if (res.status === 200 && res.data.exists) {
                return res.data.userId; // Assuming userId is returned in response
              }
            } catch (error) {
              console.error("Error fetching user ID for email:", email, error);
            }
          });
  
          Promise.all(attendeePromises).then((attendeeIds) => {
            // Emit notification to each attendee
            attendeeIds.forEach((receiverId) => {
              if (receiverId) {
                const notification = {
                  title: 'Meeting Canceled',
                  message: `The meeting "${meeting.title}" has been canceled by the organizer.`,
                  
                };
  
                // Emit socket event to send notification to the receiverId
                socket.emit('send_notification', {
                  receiverId,
                  notification
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
    navigate('/app/create-meeting',{state:{meeting}})
    onClose();
  };

  const handleJoinMeeting = () => {
    if (meeting.link) {
      window.open(meeting.link, '_blank');
    }
  };

  const formatAttendees = (attendees) => {
    if (Array.isArray(attendees)) {
      return attendees.map((attendee) => attendee.name || attendee).join(', ');
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
        
        <Button
          onClick={onClose}
          className="absolute top-3 right-3  text-black-200 hover:bg-white bg-white text-lg"
        >
          <X size={24} className='cursor-pointer'/>
        </Button>
        <h2 className="text-2xl font-semibold mb-4">{meeting.title}</h2>
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${meeting.type === 'online' ? 'bg-blue-500' : 'bg-green-500'}`}>
            {meeting.type === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>
        {isMyMeeting && meeting.attendees?.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <Users size={16} className="mt-0.5" />
            <span className="flex-1 break-words">
              {formatAttendees(meeting.attendees)}
            </span>
          </div>
        )}
        {meeting.agenda && (
          <p className="text-gray-700 mb-3">
            <strong>Agenda:</strong> {meeting.agenda}
          </p>
        )}
        <div className="space-y-2 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            {formatDate(meeting.startTime)}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            {formatTime(meeting.startTime, meeting.timezone, userTimezone)} - 
            {formatTime(meeting.endTime, meeting.timezone, userTimezone)}
          </div>
          <div className="flex items-center gap-2">
            {meeting.type === 'online' ? <Video size={16} /> : <MapPin size={16} />}
            {meeting.type === 'online' ? 'Online Meeting' : meeting.location}
          </div>
        </div>

        
        {meeting.organizer?.name && (
          <div className="mt-3 text-sm text-gray-600">
            <strong>Organizer:</strong> {meeting.organizer.name}
          </div>
        )}

        {meeting.type === 'online' && (
          <Button
            onClick={handleJoinMeeting}
            className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Join Meeting
          </Button>
        )}

        {isMyMeeting && (
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleEdit}
              className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 cursor-pointer"
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingModal;
