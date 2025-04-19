import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeetings } from '../features/meetingSlice';
import Header from './ui/Header';
import Calender from './Calender';
import { DateTime } from 'luxon';
import CalenderModal from './CalenderModal';


const formatTime = (dateString, meetingZone, userZone) => {
  if (!dateString || !meetingZone || !userZone) return '';
  try {
    return DateTime
      .fromISO(dateString, { zone: meetingZone })
      .setZone(userZone)
      .toFormat('hh:mm a');
  } catch {
    return '';
  }
};

const MainCalendar = () => {
    const dispatch = useDispatch();
   
    const { created, invited, loading, error } = useSelector((state) => state.meeting);
    const userTimezone = useSelector((state) => state.auth.user?.timezone);
  
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState(null); // Selected state for navbar
  
    const allMeetings = [...new Map([...created, ...invited].map(m => [m._id, m])).values()];
  
    const events = userTimezone
      ? allMeetings.map(meeting => {
          const meetingDate = DateTime.fromISO(meeting.date, { zone: meeting.timezone })
            .setZone(userTimezone)
            .toISODate();
          const formattedTime = formatTime(meeting.date, meeting.timezone, userTimezone);
          return {
            date: meetingDate,
            type: meeting.type || '',
            time: formattedTime,
          };
        })
      : [];
  
    const selectedMeetings = selectedDate && userTimezone
      ? allMeetings.filter(meeting => {
          const meetingDate = DateTime.fromISO(meeting.date, { zone: meeting.timezone })
            .setZone(userTimezone)
            .toISODate();
          return meetingDate === selectedDate;
        })
      : [];
  
    useEffect(() => {
      dispatch(fetchMeetings());
    }, [dispatch]);
  
    const handleDateClick = (dateStr) => {
      setSelectedDate(dateStr);
      setIsModalOpen(true);
    };
  
    if (!userTimezone) {
      return <div className="text-center text-red-500 mt-10 text-lg">User timezone not available!</div>;
    }
  
    if (loading) {
      return <div className="text-center text-blue-600 mt-10 text-lg">Loading meetings...</div>;
    }
  
    if (error) {
      return <div className="text-center text-red-500 mt-10 text-lg">Error fetching meetings: {error}</div>;
    }
  
    return (
      <div className="p-4 sm:p-6 lg:p-10 bg-gray-50 min-h-screen">
        <Header title="Calendar" />
  
        <div className="flex flex-col items-center mt-8">
          <Calender
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </div>
  
        <CalenderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          meetings={selectedMeetings}
          date={selectedDate}
          userTimezone={userTimezone}
          
        />
      </div>
    );
  };
  
export default MainCalendar;
