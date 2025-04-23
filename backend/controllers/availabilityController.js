import { DateTime, Interval } from 'luxon';
import Meeting from '../models/meetingModel.js';
import User from '../models/userModel.js';

export const checkAvailability = async (req, res) => {
  try {
    const { date, attendees, organizer, duration = 60 } = req.query;

    if (!date || !attendees || !organizer) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const attendeeEmails = attendees.split(',');

    const attendeeUsers = await User.find({ email: { $in: attendeeEmails } });
    const organizerUser = await User.findById(organizer);
    if (!organizerUser) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const allUsers = [...attendeeUsers, organizerUser];
    const userIds = allUsers.map((u) => u._id);

    const organizerTZ = organizerUser.timezone;
    if (!organizerTZ) {
      return res.status(400).json({ message: 'Organizer has no timezone set' });
    }

    const startOfDay = DateTime.fromISO(date, { zone: organizerTZ }).startOf('day').toUTC();
    const endOfDay = DateTime.fromISO(date, { zone: organizerTZ }).endOf('day').toUTC();

    const meetings = await Meeting.find({
      $or: [
        { organizer: { $in: userIds } },
        { attendees: { $in: userIds } },
      ],
      date: { $gte: startOfDay.toJSDate(), $lte: endOfDay.toJSDate() },
    });

    const slotDuration = parseInt(duration);
    const workingStart = DateTime.fromISO(date, { zone: organizerTZ }).set({ hour: 9, minute: 0 });
    const workingEnd = workingStart.set({ hour: 18, minute: 0 });

    const slots = [];
    let current = workingStart;

    while (current.plus({ minutes: slotDuration }) <= workingEnd) {
      const slotStart = current;
      const slotEnd = current.plus({ minutes: slotDuration });

      const hasConflict = meetings.some((meeting) => {
        const meetingStart = DateTime.fromJSDate(meeting.startTime);
        const meetingEnd = DateTime.fromJSDate(meeting.endTime);
        const meetingInterval = Interval.fromDateTimes(meetingStart, meetingEnd);
        const slotInterval = Interval.fromDateTimes(slotStart, slotEnd);

        return meetingInterval.overlaps(slotInterval);
      });

      if (!hasConflict) {
        slots.push({
          label: `${slotStart.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`,
          startUTC: slotStart.toUTC().toJSDate(),
          endUTC: slotEnd.toUTC().toJSDate(),
        });
      }

      current = slotEnd;
    }

    return res.status(200).json({ slots: slots.map((s) => s.label) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
