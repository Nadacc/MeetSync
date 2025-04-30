import React from 'react';
import Button from './ui/Button';
import { DateTime } from 'luxon';
import { X } from 'lucide-react';

const PreMeetingModal = ({ onClose, startTime, userTimezone }) => {
    const formatTime = (dateString, fromZone, toZone) => {
      const safeFromZone = fromZone || 'UTC';
      const safeToZone = toZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
      return DateTime
        .fromISO(dateString, { zone: safeFromZone })
        .setZone(safeToZone)
        .toFormat('hh:mm a');
    };
  const formattedStartTime = formatTime(startTime, 'UTC', userTimezone); 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 text-black-200 hover:bg-white bg-white text-lg"
        >
          <X size={24} className='cursor-pointer'/>
        </Button>
        <h2 className="text-2xl font-semibold mb-4 text-center text-red-500">Meeting Not Started Yet</h2>
        <p className="text-center text-gray-700 mb-4">
          The meeting will start at <strong>{formattedStartTime}</strong>. Please try joining after the scheduled time.
        </p>
        
      </div>
    </div>
  );
};

export default PreMeetingModal;
