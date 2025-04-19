import User from '../models/userModel.js';
import Meeting from "../models/meetingModel.js";


export const createMeetingService = async (data, organizerId) => {
  const {
    title,
    agenda,
    type,
    location,
    startTime,
    endTime,
    date,  // New date field
    attendees, // Now an array of emails
    timezone,
  } = data;

  // ✅ Find users by email
  const users = await User.find({ email: { $in: attendees } }).select('_id email');

  // ❗ Find emails that weren't matched
  const foundEmails = users.map(user => user.email);
  const notFoundEmails = attendees.filter(email => !foundEmails.includes(email));

  if (notFoundEmails.length > 0) {
    throw new Error(`These emails are not registered users: ${notFoundEmails.join(', ')}`);
  }

  const attendeeIds = users.map(user => user._id);

  // ✅ Create meeting with resolved IDs
  const newMeeting = new Meeting({
    title,
    agenda,
    type,
    location: type === "in-person" ? location : undefined,
    startTime,
    endTime,
    date,  // Storing the date as well
    attendees: attendeeIds,
    organizer: organizerId,
    timezone,
  });

  await newMeeting.save();
  return newMeeting;
};


export const getUserMeetingsService = async (userId) => {
    try {
      const createdMeetings = await Meeting.find({ organizer: userId }).populate('attendees');
      const invitedMeetings = await Meeting.find({ attendees: userId, organizer: { $ne: userId } }).populate('organizer');
      
      return { created: createdMeetings, invited: invitedMeetings };
    } catch (err) {
      throw new Error('Error fetching meetings: ' + err.message);
    }
};

export const updateMeetingService = async (id, data, userId) => {
    const meeting = await Meeting.findById(id);
    if (!meeting) throw new Error("Meeting not found");
    if (!meeting.organizer.equals(userId)) throw new Error("Unauthorized");
  
    Object.assign(meeting, data);
    await meeting.save();
    return meeting;
  };
  
  export const deleteMeetingService = async (id, userId) => {
    const meeting = await Meeting.findById(id);
    if (!meeting) throw new Error("Meeting not found");
    if (!meeting.organizer.equals(userId)) throw new Error("Unauthorized");
  
    await Meeting.deleteOne({ _id: id });
  };
  