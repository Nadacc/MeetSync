// Suggested Update to checkAvailability to use stored user timezones

import Meeting from '../models/meetingModel.js';
import User from '../models/userModel.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const checkAvailability = async (req, res) => {
    try {
      const { date, attendees, organizer, duration = 60 } = req.query;
  
      if (!date || !attendees || !organizer) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
  
      const attendeeEmails = attendees.split(',');
  
      // ✅ Fetch attendee users
      const attendeeUsers = await User.find({ email: { $in: attendeeEmails } });
  
      // ✅ Fetch organizer user
      const organizerUser = await User.findById(organizer);
      if (!organizerUser) {
        return res.status(404).json({ message: 'Organizer not found' });
      }
  
      const allUsers = [...attendeeUsers, organizerUser];
      const userIds = allUsers.map(u => u._id);
  
      // ✅ Get the reference timezone (use organizer's)
      const timezone = organizerUser.timezone;
      if (!timezone) {
        return res.status(400).json({ message: 'Organizer has no timezone set' });
      }
  
      const startOfDay = dayjs.tz(`${date}T00:00:00`, timezone).utc();
      const endOfDay = dayjs.tz(`${date}T23:59:59`, timezone).utc();
  
      // ✅ Get all meetings that involve any of these users
      const meetings = await Meeting.find({
        $or: [
          { organizer: { $in: userIds } },
          { attendees: { $in: userIds } },
        ],
        date: { $gte: startOfDay.toDate(), $lte: endOfDay.toDate() }
      });
  
      // ✅ Generate working hour slots
      const slotDuration = parseInt(duration);
      const workingStart = dayjs.tz(`${date}T09:00:00`, timezone);
      const workingEnd = dayjs.tz(`${date}T18:00:00`, timezone);
  
      const slots = [];
      let current = workingStart;
  
      while (current.add(slotDuration, 'minute').isBefore(workingEnd)) {
        const slotStart = current;
        const slotEnd = current.add(slotDuration, 'minute');
  
        const hasConflict = meetings.some(meeting => {
          return (
            // Slot starts during meeting
            (slotStart.toDate() >= meeting.startTime && slotStart.toDate() < meeting.endTime) ||
            // Slot ends during meeting
            (slotEnd.toDate() > meeting.startTime && slotEnd.toDate() <= meeting.endTime) ||
            // Slot fully wraps around meeting
            (slotStart.toDate() <= meeting.startTime && slotEnd.toDate() >= meeting.endTime)
          );
        });
  
        if (!hasConflict) {
          slots.push({
            label: `${slotStart.format('hh:mm A')} - ${slotEnd.format('hh:mm A')}`,
            startUTC: slotStart.utc().toDate(),
            endUTC: slotEnd.utc().toDate()
          });
        }
  
        current = slotEnd;
      }
  
      return res.status(200).json({ slots: slots.map(slot => slot.label) });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };
  