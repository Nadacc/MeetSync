import express from 'express';
import { searchEmails } from '../controllers/emailController.js';
const router = express.Router();

router.get('/search-email',searchEmails)
export default router