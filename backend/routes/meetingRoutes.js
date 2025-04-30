import express from 'express'
import { createMeeting, deleteMeeting, fetchMeetingById, getUserMeetings, updateMeeting } from '../controllers/meetingController.js';
const router = express.Router();
import authenticate from '../middleware/authMiddleware.js';


router.post('/create',authenticate,createMeeting)
router.get('/user',authenticate,getUserMeetings)
router.get('/:id',authenticate,fetchMeetingById)
router.patch('/update/:id',authenticate,updateMeeting)
router.delete('/delete/:id',authenticate,deleteMeeting)




export default router