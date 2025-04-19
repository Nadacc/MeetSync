import React from 'react';
import { CalendarDays, MapPin, Video, Clock, Users } from 'lucide-react';
import { DateTime } from 'luxon';
import { useDispatch } from 'react-redux';
import { deleteMeeting } from '../features/meetingSlice';

// Format date with suffix (e.g., 18th April 2025)
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

// Format time based on timezone
const formatTime = (dateString, fromZone, toZone) => {
  const safeFromZone = fromZone || 'UTC';
  const safeToZone = toZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return DateTime
    .fromISO(dateString, { zone: safeFromZone })
    .setZone(safeToZone)
    .toFormat('hh:mm a');
};

const MeetingModal = ({ meeting, onClose, isMyMeeting, userTimezone, onEdit }) => {
  if (!meeting) return null;

  const dispatch = useDispatch();

  const handleDelete = () => {
    const confirm = window.confirm('Are you sure you want to cancel this meeting?');
    if (confirm) {
      dispatch(deleteMeeting(meeting._id))
        .unwrap()
        .then(() => onClose())
        .catch((err) => alert(`Failed to cancel: ${err}`));
    }
  };

  const handleEdit = () => {
    onEdit(meeting);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4">{meeting.title}</h2>

        {/* Meeting Type */}
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${meeting.type === 'online' ? 'bg-blue-500' : 'bg-green-500'}`}>
            {meeting.type === 'online' ? 'Online' : 'In-Person'}
          </span>
        </div>

        {/* Attendees */}
        {isMyMeeting && meeting.attendees?.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <Users size={16} className="mt-0.5" />
            <span className="flex-1 break-words">
              {formatAttendees(meeting.attendees)}
            </span>
          </div>
        )}

        {/* Agenda */}
        {meeting.agenda && (
          <p className="text-gray-700 mb-3">
            <strong>Agenda:</strong> {meeting.agenda}
          </p>
        )}

        {/* Date, Time, Location */}
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

        {/* Organizer */}
        {meeting.organizer?.name && (
          <div className="mt-3 text-sm text-gray-600">
            <strong>Organizer:</strong> {meeting.organizer.name}
          </div>
        )}

        {/* Buttons */}
        {meeting.type === 'online' && (
          <button
            onClick={handleJoinMeeting}
            className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Join Meeting
          </button>
        )}

        {/* Edit & Delete Buttons for My Meetings */}
        {isMyMeeting && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleEdit}
              className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingModal;
