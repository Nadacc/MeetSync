import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  agenda: String,
  type: {
    type: String,
    enum: ['in-person', 'online'],
    required: true,
  },
  location: {
    type: String, // e.g., room name or address
    required: function () {
      return this.type === 'in-person';
    },
  },
  startTime: { 
    type: Date, 
    required: true,
  },
  endTime: { 
    type: Date, 
    required: true,
  },
  date: {
    type: Date,  // This field stores the date of the meeting
    required: true,
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  timezone: String,
  createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
