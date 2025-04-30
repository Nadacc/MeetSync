import React, { useState, useEffect } from 'react';
import Header from './ui/Header';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createMeeting,updateMeeting } from '../features/meetingSlice';
import axiosInstance from '../api/axiosInstance';
import { DateTime } from 'luxon';
import Label from './ui/Label';
import Input from './ui/Input';
import Button from './ui/Button';
import Textarea from './ui/TextArea';
import AlertBox from './ui/AlertBox';
import { Plus, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { meetingSchema } from '../utils/Validation/meetingSchema';
import toast from 'react-hot-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import socket from '../socket';
import AddAttendees from './AddAttendee';

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

  return dt.toUTC().toISO(); 
}


function CreateMeeting() {
  const location = useLocation();
  const meetingToEdit = location.state?.meeting;
  const prefilledDate = location.state?.selectedDate || meetingToEdit?.startTime?.split('T')[0] || '';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState:{errors},
  } = useForm({
    resolver:yupResolver(meetingSchema),
    defaultValues: {
      title: meetingToEdit?.title || '',
      agenda: meetingToEdit?.agenda || '',
      type: meetingToEdit?.type || 'online',
      location: meetingToEdit?.location || '',
      duration: meetingToEdit?.duration || 30,
    },
  });

  console.log("Form Errors:", errors);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.meeting);
  const user = useSelector(state => state.auth.user);
  const userId = user?._id;
  const userEmail = user?.email;
  const userTimezone = user?.timezone;
  const [attendees, setAttendees] = useState(['']);
  const [selectedDate, setSelectedDate] = useState(prefilledDate);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attendeeError, setAttendeeError] = useState('');
  const [alert, setAlert] = useState({ message: '', type: '' });

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
  
  useEffect(() => {
    if (meetingToEdit) {
      const initialAttendees = meetingToEdit.attendees.map(att => 
        typeof att === 'string' ? att : att.email
      );
      setAttendees([...initialAttendees, '']);
      
      const startDate = meetingToEdit.startTime.split('T')[0];
      setSelectedDate(startDate);
      
      const startTime = DateTime.fromISO(meetingToEdit.startTime)
        .setZone(meetingToEdit.timezone)
        .toFormat('hh:mm a');
      const endTime = DateTime.fromISO(meetingToEdit.endTime)
        .setZone(meetingToEdit.timezone)
        .toFormat('hh:mm a');
      const timeSlot = `${startTime} - ${endTime}`;
      setSelectedSlot(timeSlot);

      handleDateChange(startDate);
    }
  }, [meetingToEdit]);

  const handleAddAttendee = async() => {
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

    try {
      const res = await axiosInstance.get(`/users/check-email?email=${newEmail}&context=attendee-check`);
      if (res.status === 200 && res.data.exists) {
        setAttendees([...attendees, '']);
        setAttendeeError('');
      } else {
        setAttendeeError('Email does not exist in the system.');
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setAttendeeError('email does not exist');
    }
  };

  const handleAttendeeChange = (index, value) => {
    const updated = [...attendees];
    updated[index] = value;
    setAttendees(updated);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const validAttendees = attendees.filter(email => email.trim() !== '');
    const timezone = userTimezone;
  
    if (validAttendees.length === 0 || !userId || !userTimezone) return;
  
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
    console.log('Submitting form with data',data);
    
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }
  
    if (attendees.filter(email => email.trim()).length === 0) {
      setAlert({ message: "Please add at least one attendee.", type: 'error' });
      return;
    }
  
    const [rawStart, rawEnd] = selectedSlot.split(' - ');
    const timezone = userTimezone
  
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
      let resultAction;
      if (meetingToEdit) {
        resultAction = await dispatch(updateMeeting({ 
          id: meetingToEdit._id, 
          meeting: payload 
        }));
      } else {
        resultAction = await dispatch(createMeeting(payload));
      }

      if (createMeeting.fulfilled.match(resultAction) || updateMeeting.fulfilled.match(resultAction)) {
        const validAttendees = attendees.filter(email => email.trim());
        console.log("Meeting saved, getting user IDs for attendees...");

const attendeePromises = validAttendees.map(async (attendeeEmail) => {
  try {
    const res = await axiosInstance.get(`/users/check-email?email=${attendeeEmail}&context=attendee-check`);
    if (res.status === 200 && res.data.exists) {
      console.log("Found user ID for:", attendeeEmail, "->", res.data.userId);
      return res.data.userId;
    } else {
      console.warn("No user found for:", attendeeEmail);
    }
  } catch (err) {
    console.error("Error getting user ID:", err);
  }
});

const attendeeIds = await Promise.all(attendeePromises);

console.log("🎯 Final receiver IDs:", attendeeIds);

for (const receiverId of attendeeIds) {
  if (receiverId) {
    const notification = {
      title: meetingToEdit ? 'Meeting Updated' : 'New Meeting Invitation',
      message: `${user.name || user.email} has ${meetingToEdit ? 'updated' : 'invited you to'} a meeting: ${data.title}`,
      meetingId:(meetingToEdit ? meetingToEdit._id : resultAction.payload._id)
    };

    console.log("🔔 Sending socket notification to:", receiverId);

    socket.emit('send_notification', {
      receiverId,
      notification
    });
  }
}

        
        reset();
        setAttendees(['']);
        setAvailableSlots([]);
        setSelectedDate('');
        setSelectedSlot(null);
        toast.success(meetingToEdit ? 'Meeting updated successfully!' : 'Meeting created successfully!');
        navigate('/app/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred while creating the meeting. Please try again.');

    }
  };
  

  return (
    <div>
      <Header title={meetingToEdit ? "Edit Meeting" : "Create Meeting"} />
      <div className="max-w-3xl mx-auto p-4 space-y-8">
      {alert.message && (
        <AlertBox
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: '', type: '' })}
        />
      )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <Label>Title</Label>
            <Input {...register('title')} placeholder="Meeting Title" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Agenda</Label>
            <Textarea {...register('agenda')} placeholder="Agenda" />
            {errors.agenda && <p className="text-red-500 text-sm">{errors.agenda.message}</p>}
          </div>

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

          {meetingType === 'in-person' && (
            <div>
              <Label>Location</Label>
              <Input {...register('location')} placeholder="Location" />
              {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
            </div>
          )}

          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" {...register('duration')} placeholder="30" />
            {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
          </div>

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
              {/* <AddAttendees/> */}
            </div>
            {attendeeError && <p className="text-red-500 text-sm mt-1">{attendeeError}</p>}

            <div className="flex flex-wrap gap-2 mt-4 ">
              {attendees.slice(0, -1).map((email, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  <span >{email}</span>
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

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={attendees.filter(a => a.trim()).length === 0}
            />

          </div>

          {/* {loading && <p>Loading available slots...</p>} */}
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
            {loading ? 'Saving...' : meetingToEdit ? 'Update Meeting' : 'Create Meeting'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreateMeeting;
