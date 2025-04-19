import React from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const day = date.getDate();
  const daySuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${day}${daySuffix(day)} ${date.toLocaleDateString('en-US', options).split(' ')[0]} ${date.getFullYear()}`;
};

const formatTime = (dateString, meetingZone, userZone) => {
  return DateTime
    .fromISO(dateString, { zone: meetingZone })
    .setZone(userZone)
    .toFormat('hh:mm a');
};

const MeetingCard = ({ meeting, showOrganizer = false, onClick }) => {
  const userTimezone =
    useSelector((state) => state.auth.user?.timezone) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div
      onClick={() => onClick(meeting)}
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-lg font-semibold mb-3">{meeting.title}</h3>

      <span
        className={`inline-block px-2 py-1 mb-2 rounded-full text-white text-xs ${
          meeting.type === 'online' ? 'bg-blue-500' : 'bg-green-500'
        }`}
      >
        {meeting.type}
      </span>

      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
        <CalendarDays size={14} />
        {formatDate(meeting.startTime)}
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
        <Clock size={14} />
        {formatTime(meeting.startTime, meeting.timezone, userTimezone)}
      </div>

      {meeting.type === 'in-person' && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
          <MapPin size={14} /> {meeting.location}
        </div>
      )}

      {showOrganizer && (
        <div className="text-sm text-gray-600">
          <strong>Organizer:</strong> {meeting.organizer?.name || 'N/A'}
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
