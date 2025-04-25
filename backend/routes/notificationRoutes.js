import express from 'express'
const router = express.Router();
import authenticate from '../middleware/authMiddleware.js';
import { createNotification, getNotifications, markAsRead } from '../controllers/notificationController.js';


router.get('/',authenticate,getNotifications)
router.post('/read',authenticate,markAsRead)
router.post('/',authenticate,createNotification)

export default router