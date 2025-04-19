import {createMeetingService, getUserMeetingsService,updateMeetingService,deleteMeetingService} from "../services/meetingService.js";


export const createMeeting = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const meeting = await createMeetingService(req.body, organizerId);
    res.status(201).json({ message: "Meeting created", meeting });
  } catch (err) {
    res.status(500).json({ message: "Error creating meeting", error: err.message });
  }
};


export const getUserMeetings = async (req, res) => {
    try {
      const userId = req.user._id;
      const meetings = await getUserMeetingsService(userId);
      
      res.status(200).json(meetings);
    } catch (err) {
      console.error("Get meetings error:", err);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  };
  
  export const updateMeeting = async (req, res) => {
    try {
      const meeting = await updateMeetingService(req.params.id, req.body, req.user._id);
      res.status(200).json({ message: "Meeting updated", meeting });
    } catch (err) {
      res.status(500).json({ message: "Error updating meeting", error: err.message });
    }
  };
  
  export const deleteMeeting = async (req, res) => {
    try {
      await deleteMeetingService(req.params.id, req.user._id);
      res.status(200).json({ message: "Meeting deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting meeting", error: err.message });
    }
  };
