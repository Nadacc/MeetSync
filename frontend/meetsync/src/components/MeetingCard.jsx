import React from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, MapPin, Clock, Video, Users } from 'lucide-react';
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
      className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden hover:border-blue-100"
    >
      {/* Header with gradient background */}
      <div className={`px-6 py-4 ${meeting.type === 'online' ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-gradient-to-r from-green-50 to-green-100'}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {meeting.title}
          </h3>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              meeting.type === 'online' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {meeting.type === 'online' ? (
              <Video className="w-3 h-3 mr-1" />
            ) : (
              <MapPin className="w-3 h-3 mr-1" />
            )}
            {meeting.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date and Time */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(meeting.startTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Time</p>
              <p className="text-sm font-medium text-gray-800">
                {formatTime(meeting.startTime, meeting.timezone, userTimezone)}
              </p>
            </div>
          </div>

          {/* Location (for in-person meetings) */}
          {meeting.type === 'in-person' && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-800">
                  {meeting.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Organizer */}
        {showOrganizer && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Organizer</p>
              <p className="text-sm font-medium text-gray-800">
                {meeting.organizer?.name || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;