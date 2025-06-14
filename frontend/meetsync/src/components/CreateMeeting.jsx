import React, { useState, useEffect } from 'react';
import Header from './ui/Header';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createMeeting, updateMeeting } from '../features/meetingSlice';
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(meetingSchema),
    defaultValues: {
      title: meetingToEdit?.title || '',
      agenda: meetingToEdit?.agenda || '',
      type: meetingToEdit?.type || 'online',
      location: meetingToEdit?.location || '',
      duration: meetingToEdit?.duration || 30,
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.meeting);
  const user = useSelector((state) => state.auth.user);
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
    if (selectedDate && attendees.filter((e) => e.trim()).length > 0) {
      handleDateChange(selectedDate);
    }
  }, [attendees, duration]);

  useEffect(() => {
    if (meetingToEdit) {
      const initialAttendees = meetingToEdit.attendees.map((att) =>
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

  const handleAddAttendee = async () => {
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
      console.error('Error checking email:', err);
      setAttendeeError('Email does not exist');
    }
  };

  const handleAttendeeChange = (index, value) => {
    const updated = [...attendees];
    updated[index] = value;
    setAttendees(updated);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const validAttendees = attendees.filter((email) => email.trim() !== '');
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
      console.error('Error fetching availability:', err);
      setAvailableSlots([]);
    }
  };

  const handleCancel = () => {
    navigate('/app/dashboard');
  };

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      toast.error('Please select a time slot.');
      return;
    }

    if (attendees.filter((email) => email.trim()).length === 0) {
      setAlert({ message: 'Please add at least one attendee.', type: 'error' });
      return;
    }

    const [rawStart, rawEnd] = selectedSlot.split(' - ');
    const timezone = userTimezone;

    const startTime = convertToISO(selectedDate, rawStart, timezone);
    const endTime = convertToISO(selectedDate, rawEnd, timezone);

    const payload = {
      ...data,
      attendees: attendees.filter((email) => email.trim()),
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
        resultAction = await dispatch(updateMeeting({ id: meetingToEdit._id, meeting: payload }));
      } else {
        resultAction = await dispatch(createMeeting(payload));
      }

      if (createMeeting.fulfilled.match(resultAction) || updateMeeting.fulfilled.match(resultAction)) {
        const validAttendees = attendees.filter((email) => email.trim());

        const attendeePromises = validAttendees.map(async (attendeeEmail) => {
          try {
            const res = await axiosInstance.get(`/users/check-email?email=${attendeeEmail}&context=attendee-check`);
            if (res.status === 200 && res.data.exists) {
              return res.data.userId;
            }
          } catch (err) {
            console.error('Error getting user ID:', err);
          }
        });

        const attendeeIds = await Promise.all(attendeePromises);

        for (const receiverId of attendeeIds) {
          if (receiverId) {
            const notification = {
              title: meetingToEdit ? 'Meeting Updated' : 'New Meeting Invitation',
              message: `${user.name || user.email} has ${meetingToEdit ? 'updated' : 'invited you to'} a meeting: ${data.title}`,
              meetingId: meetingToEdit ? meetingToEdit._id : resultAction.payload._id,
            };

            socket.emit('send_notification', {
              receiverId,
              notification,
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
    <div className="min-h-screen bg-gray-100">
      <Header title={meetingToEdit ? 'Edit Meeting' : 'Create Meeting'} className="bg-white shadow-md" />
      <div className="max-w-4xl mx-auto p-6">
        {alert.message && (
          <AlertBox
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ message: '', type: '' })}
            className="mb-6"
          />
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-8"
        >
          {/* Title */}
          <div>
            <Label className="text-gray-700 font-semibold">Title</Label>
            <Input
              {...register('title')}
              placeholder="Enter meeting title"
              className="mt-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Agenda */}
          <div>
            <Label className="text-gray-700 font-semibold">Agenda</Label>
            <Textarea
              {...register('agenda')}
              placeholder="Describe the meeting agenda"
              className="mt-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.agenda && (
              <p className="mt-1 text-sm text-red-500">{errors.agenda.message}</p>
            )}
          </div>

          {/* Meeting Type */}
          <div className="flex items-center gap-6">
            <Label className="flex items-center text-gray-700 font-semibold">
              <input
                type="radio"
                value="online"
                {...register('type')}
                className="mr-2 accent-blue-600"
                defaultChecked
              />
              Online
            </Label>
            <Label className="flex items-center text-gray-700 font-semibold">
              <input
                type="radio"
                value="in-person"
                {...register('type')}
                className="mr-2 accent-blue-600"
              />
              In-Person
            </Label>
          </div>

          {/* Location (for in-person) */}
          {meetingType === 'in-person' && (
            <div>
              <Label className="text-gray-700 font-semibold">Location</Label>
              <Input
                {...register('location')}
                placeholder="Enter meeting location"
                className="mt-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          )}

          {/* Duration */}
          <div>
            <Label className="text-gray-700 font-semibold">Duration (minutes)</Label>
            <Input
              type="number"
              {...register('duration')}
              placeholder="30"
              className="mt-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          {/* Attendees */}
          <div>
            <Label className="text-gray-700 font-semibold">Attendees</Label>
            <div className="relative mt-2">
              <Input
                value={attendees[attendees.length - 1]}
                onChange={(e) => handleAttendeeChange(attendees.length - 1, e.target.value)}
                placeholder={`Attendee ${attendees.length} Email`}
                className="w-full pr-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="absolute inset-y-0 right-3 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {attendeeError && (
              <p className="mt-1 text-sm text-red-500">{attendeeError}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {attendees.slice(0, -1).map((email, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-50 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = attendees.filter((_, i) => i !== index);
                      setAttendees(updated);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-gray-700 font-semibold">Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={attendees.filter((a) => a.trim()).length === 0}
              className="mt-2 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Selected Time Slot (for editing) */}
          {meetingToEdit && selectedSlot && (
            <div>
              <Label className="text-gray-700 font-semibold">Selected Time Slot</Label>
              <div className="mt-2">
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white border border-blue-600">
                  {selectedSlot}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Available Time Slots */}
          {availableSlots.length > 0 && (
            <div>
              <Label className="text-gray-700 font-semibold">Available Time Slots</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Slots Message */}
          {availableSlots.length === 0 && selectedDate && !loading && !meetingToEdit && (
            <p className="text-gray-500 text-sm">No available slots for the selected date.</p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            {meetingToEdit && (
              <Button
                type="button"
                onClick={handleCancel}
                className="py-3 px-6 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className={`py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {loading ? 'Saving...' : meetingToEdit ? 'Update Meeting' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMeeting;