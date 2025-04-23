import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    <div className="w-full max-w-xl mx-auto bg-white shadow-md rounded-lg p-4 sm:p-6 overflow-x-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <button onClick={handlePrev} className="text-xl sm:text-2xl">
          <ChevronLeft />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold">
          {currentMonth.toFormat('MMMM yyyy')}
        </h2>
        <button onClick={handleNext} className="text-xl sm:text-2xl">
          <ChevronRight />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-gray-500 mb-2 sm:mb-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-semibold text-sm sm:text-base">{day}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {generateCalendarDays().map((date) => {
          const isCurrentMonth = date.month === currentMonth.month;
          const dateStr = date.toISODate();
          const isPast = date < DateTime.local().startOf('day') && isCurrentMonth;

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`relative rounded-full flex items-center justify-center text-sm sm:text-base transition 
                ${isCurrentMonth ? '' : 'text-gray-300'}
                ${isPast ? 'text-gray-400' : ''}
                ${isToday(date) ? 'border-2 sm:border-4 border-blue-500' : ''}
                ${isSelected(date) ? 'bg-blue-500 text-white' : 'hover:bg-blue-200'}
                w-10 h-10 sm:w-14 sm:h-14
              `}
            >
              {date.day}
              {isEventDate(date) && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calender;
