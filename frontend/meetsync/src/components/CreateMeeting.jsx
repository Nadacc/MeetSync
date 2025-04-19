import React, { useState, useEffect } from 'react';
import Header from './ui/Header';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createMeeting } from '../features/meetingSlice';
import axiosInstance from '../api/axiosInstance';
import { DateTime } from 'luxon';
import Label from './ui/Label';
import Input from './ui/Input';
import Button from './ui/Button';
import Textarea from './ui/TextArea';
import { Plus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup'

function convertToISO(dateStr, timeStr, timezone) {
  const [hourMinute, meridian] = timeStr.split(' ');
  let [hour, minute] = hourMinute.split(':').map(Number);
  if (meridian.toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (meridian.toLowerCase() === 'am' && hour === 12) hour = 0;

  const dt = DateTime.fromObject(
    {
      year: Number(dateStr.slice(0, 4)),
      month: Number(dateStr.slice(5, 7)),
      day: Number(dateStr.slice(8, 10)),
      hour,
      minute,
    },
    { zone: timezone }
  );

  return dt.toUTC().toISO(); // UTC ISO string
}


const meetingSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  agenda: yup.string().required('Agenda is required'),
  type: yup.string().oneOf(['online', 'in-person'], 'Invalid meeting type').required('Meeting type is required'),
  location: yup.string().when('type', {
    is: 'in-person',
    then: (schema) => schema.required('Location is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  attendees: yup.array().of(
    yup.string().email('Invalid email')
  ).min(1, 'At least one attendee is required'),
  date: yup.date().required('Date is required'),
  timeSlot: yup.string().required('Time slot is required'),
});


function CreateMeeting() {
  const location = useLocation();
  const prefilledDate = location.state?.selectedDate || '';

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      agenda: '',
      type: 'online',
      location: '',
      duration: 30,
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.meeting);
  const user = useSelector(state => state.auth.user);
  const userId = user?._id;
  const userEmail = user?.email;


  const [attendees, setAttendees] = useState(['']);
  const [selectedDate, setSelectedDate] = useState(prefilledDate);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attendeeError, setAttendeeError] = useState('');

  const meetingType = watch('type');
  const duration = watch('duration');

  useEffect(() => {
    if (prefilledDate && attendees.length > 1) {
      handleDateChange(prefilledDate);
    }
  }, [prefilledDate, attendees]);

  useEffect(() => {
    if (selectedDate && attendees.filter(e => e.trim()).length > 0) {
      handleDateChange(selectedDate);
    }
  }, [attendees, duration]);
  

  const handleAddAttendee = () => {
    const newEmail = attendees[attendees.length - 1].trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newEmail) {
      setAttendeeError('Please enter an email address before adding another.');
      return;
    }

    if (!emailRegex.test(newEmail)) {
      setAttendeeError('Please enter a valid email address.');
      return;
    }

    if (attendees.slice(0, -1).includes(newEmail)) {
      setAttendeeError('This email is already added.');
      return;
    }
    if (newEmail === userEmail) {
      setAttendeeError('You cannot add yourself as an attendee.');
      return;
    }
    

    setAttendees([...attendees, '']);
    setAttendeeError('');
  };

  const handleAttendeeChange = (index, value) => {
    const updated = [...attendees];
    updated[index] = value;
    setAttendees(updated);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const validAttendees = attendees.filter(email => email.trim() !== '');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    if (validAttendees.length === 0 || !userId) return;
  
    try {
      const url = `/availability?date=${date}&attendees=${validAttendees.join(',')}&organizer=${userId}&duration=${duration}&timezone=${timezone}`;
      const res = await axiosInstance.get(url);
      if (res.status === 200) {
        setAvailableSlots(res.data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailableSlots([]);
    }
  };
  
  

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      alert("Please select a time slot.");
      return;
    }
  
    if (attendees.filter(email => email.trim()).length === 0) {
      alert("Please add at least one attendee.");
      return;
    }
  
    const [rawStart, rawEnd] = selectedSlot.split(' - ');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    const startTime = convertToISO(selectedDate, rawStart, timezone);
    const endTime = convertToISO(selectedDate, rawEnd, timezone);
  
    const payload = {
      ...data,
      attendees: attendees.filter(email => email.trim()),
      startTime,
      endTime,
      timezone,
      date: selectedDate,
    };
    
  
    if (data.type !== 'in-person') {
      delete payload.location;
    }
  
    try {
      const resultAction = await dispatch(createMeeting(payload));
      if (createMeeting.fulfilled.match(resultAction)) {
        reset();
        setAttendees(['']);
        setAvailableSlots([]);
        setSelectedDate('');
        setSelectedSlot(null);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Meeting creation failed:", error);
    }
  };
  

  return (
    <div>
      <Header title="Create Meeting" />
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input {...register('title')} placeholder="Meeting Title" />
          </div>

          {/* Agenda */}
          <div>
            <Label>Agenda</Label>
            <Textarea {...register('agenda')} placeholder="Agenda" />
          </div>

          {/* Meeting Type */}
          <div className="flex items-center gap-6">
            <Label>
              <input type="radio" value="online" {...register('type')} defaultChecked />
              Online
            </Label>
            <Label>
              <input type="radio" value="in-person" {...register('type')} />
              In-Person
            </Label>
          </div>

          {/* Location (only if in-person) */}
          {meetingType === 'in-person' && (
            <div>
              <Label>Location</Label>
              <Input {...register('location')} placeholder="Location" />
            </div>
          )}

          {/* Duration */}
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" {...register('duration')} placeholder="30" />
          </div>

          {/* Attendees */}
          <div>
            <Label>Attendees</Label>
            <div className="relative">
              <Input
                value={attendees[attendees.length - 1]}
                onChange={(e) => handleAttendeeChange(attendees.length - 1, e.target.value)}
                placeholder={`Attendee ${attendees.length} Email`}
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="absolute inset-y-0 right-2 flex items-center justify-center text-blue-600 hover:text-blue-800"
              >
                <Plus size={20} />
              </button>
            </div>
            {attendeeError && <p className="text-red-500 text-sm mt-1">{attendeeError}</p>}

            <div className="mt-4 space-y-2">
              {attendees.slice(0, -1).map((email, index) => (
                <div key={index} className="bg-blue-100 text-blue-900 px-4 py-2 rounded-md flex justify-between items-center">
                  <span className="break-all">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = attendees.filter((_, i) => i !== index);
                      setAttendees(updated);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Sets today's date as the minimum
              disabled={attendees.filter(a => a.trim()).length === 0}
            />

          </div>

          {/* Available Slots */}
          {loading && <p>Loading available slots...</p>}
          {error && <div className="bg-red-100 text-red-700 p-2 rounded">Error: {error}</div>}

          {availableSlots.length > 0 && (
            <div>
              <Label>Available Time Slots:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-150 ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-blue-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSlots.length === 0 && selectedDate && !loading && (
            <p className="text-gray-500 text-sm">No available slots for the selected date.</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreateMeeting;
