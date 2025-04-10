import express from 'express'
const router = express.Router();


import {registerUser,loginUser,refreshToken, getLoggedInUser, logoutUser, checkEmailExists, forgotPasswordController, resetPasswordController, verifyOTPController} from '../controllers/userController.js'
import authenticate from '../middleware/authMiddleware.js';

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/refreshtoken',refreshToken)
router.get('/me',authenticate,getLoggedInUser)
router.post('/logout',logoutUser)
router.post('/verify-otp',verifyOTPController)
router.get('/check-email',checkEmailExists)
router.post('/forgot-password',forgotPasswordController)
router.post('/reset-password',resetPasswordController)

export default router