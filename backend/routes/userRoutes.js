import express from 'express'
const router = express.Router();


import {registerUser,loginUser,refreshToken, getLoggedInUser, logoutUser} from '../controllers/userController.js'
import authenticate from '../middleware/authMiddleware.js';

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/refreshtoken',refreshToken)
router.get('/me',authenticate,getLoggedInUser)
router.post('/logout',logoutUser)

export default router