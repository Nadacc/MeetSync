import express from 'express';
const router = express.Router();
import authenticate from '../middleware/authMiddleware.js';
import { checkAvailability } from '../controllers/availabilityController.js';

router.get('/',authenticate,checkAvailability)
export default router