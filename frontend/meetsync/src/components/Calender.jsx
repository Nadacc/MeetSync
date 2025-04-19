import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calender.js
const Calender = ({ events = [], selectedDate, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(DateTime.local());

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const handlePrev = () => setCurrentMonth(currentMonth.minus({ months: 1 }));
  const handleNext = () => setCurrentMonth(currentMonth.plus({ months: 1 }));

  const isEventDate = (date) => {
    return events.some(event => event.date === date.toISODate());
  };

  const isToday = (date) => date.toISODate() === DateTime.local().toISODate();
  const isSelected = (date) => selectedDate === date.toISODate();

  const generateCalendarDays = () => {
    const days = [];
    let current = startDate;

    while (current <= endDate) {
      days.push(current);
      current = current.plus({ days: 1 });
    }

    return days;
  };

  return (
    <div className="max-w-xl bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handlePrev} className="text-2xl">
          <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold">
          {currentMonth.toFormat('MMMM yyyy')}
        </h2>
        <button onClick={handleNext} className="text-2xl">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-gray-500 mb-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-semibold text-lg">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays().map((date) => {
          const isCurrentMonth = date.month === currentMonth.month;
          const dateStr = date.toISODate();

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`relative rounded-full w-14 h-14 flex items-center justify-center text-lg 
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isToday(date) ? 'border-4 border-blue-500' : ''} 
                ${isSelected(date) ? 'bg-blue-500 text-white' : 'hover:bg-blue-200'}
              `}
            >
              {date.day}
              {isEventDate(date) && (
                <span className="w-2 h-2 bg-red-500 rounded-full absolute bottom-2 right-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calender;



