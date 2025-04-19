import React from 'react';
import { Dialog } from '@headlessui/react';
import { DateTime } from 'luxon';
import { Clock, Users, MapPin, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CalenderModal = ({ isOpen, onClose, meetings, date, userTimezone ,onCreateMeeting}) => {
  const navigate = useNavigate();

  const formatTime = (isoDate, timezone) => {
    return DateTime.fromISO(isoDate, { zone: timezone })
      .setZone(userTimezone)
      .toFormat('hh:mm a');
  };

  const handleCreateMeeting = () => {
    navigate('/create-meeting', { state: { selectedDate: date } });
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white max-w-2xl w-full p-6 rounded-2xl shadow-xl">
          <Dialog.Title className="text-xl font-semibold mb-4 text-gray-800">
            Meetings on {DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED)}
          </Dialog.Title>

          {/* Content */}
          {meetings.length === 0 ? (
            <div className="text-gray-500 text-lg text-center py-8">
              <p>No meetings scheduled for this day.</p>
              <button
                onClick={handleCreateMeeting}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Create Meeting
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {meetings.map(meeting => (
                  <li
                    key={meeting._id}
                    className="py-4 px-3 hover:bg-gray-50 rounded-lg transition duration-200"
                  >
                    <h4 className="text-lg font-semibold mb-1 text-gray-800">{meeting.title}</h4>

                    {/* Time Range */}
                    <div className="flex items-center text-sm text-gray-600 gap-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatTime(meeting.startTime, meeting.timezone)}
                        {meeting.endTime && (
                          <> - {formatTime(meeting.endTime, meeting.timezone)}</>
                        )}
                      </span>
                    </div>

                    {/* Type and Location/Link */}
                    <div className="flex items-center text-sm text-gray-600 gap-2 mt-1 capitalize">
                      {meeting.type === 'in-person' ? (
                        <>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{meeting.location || 'In-Person'}</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 text-gray-400" />
                          {meeting.link ? (
                            <a
                              href={meeting.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Join Meeting
                            </a>
                          ) : (
                            <span>Online</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Attendees */}
                    <div className="flex items-center text-sm text-gray-600 gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{meeting.attendees?.length || 0} people</span>
                    </div>

                    {/* Agenda */}
                    {meeting.agenda && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        <span className="font-medium text-gray-600">Agenda:</span> {meeting.agenda}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCreateMeeting}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Create New Meeting
              </button>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CalenderModal;
