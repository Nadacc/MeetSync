import express from 'express'
const router = express.Router();
import upload from '../middleware/multer.js';


import {registerUser,
    loginUser,
    refreshToken, 
    getLoggedInUser, 
    logoutUser, 
    checkEmailExists, 
    forgotPasswordController, 
    resetPasswordController, 
    verifyOTPController, 
    resendOtpController, 
    updateUserProfile} from '../controllers/userController.js'
import authenticate from '../middleware/authMiddleware.js';
import {googleLogin} from '../controllers/authController.js';

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/refreshtoken',refreshToken)
router.get('/me',authenticate,getLoggedInUser)
router.post('/logout',logoutUser)
router.post('/verify-otp',verifyOTPController)
router.post('/resend-otp',resendOtpController)
router.get('/check-email',checkEmailExists)
router.post('/forgot-password',forgotPasswordController)
router.post('/reset-password',resetPasswordController)
router.get('/google',googleLogin)
router.put('/profile', authenticate,upload.single('profilePic'), updateUserProfile);



export default router