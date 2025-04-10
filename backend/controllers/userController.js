import asyncHandler from '../utils/asyncHandler.js';
import STATUS from '../utils/constants.js';
import {generateOTP} from '../utils/otp.js';
import sendOTPEmail from '../utils/sendMail.js';
import {saveOTP}  from '../utils/otpStore.js';
import otpTemplate from '../utils/emailTemplates/otpTemplate.js';


import {
  registerUserService,
  userLoginServices,
  getUserDetails,
  logoutUserService,
  refreshAccessTokenService,
  checkEmailExistsService,
  resendOtpService,
  forgotPasswordService,
  resetPasswordService,
  verifyOtpAndRegisterService
} from '../services/userService.js';
import registerValidation from '../validation/userValidation.js';
import CustomError from '../utils/customError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

// Helper: Send Tokens as Cookies
const sendTokensAsCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: isProd, // must be true if using SameSite: 'None'
  sameSite: isProd ? 'None' : 'Lax', // fallback to 'Lax' in development
  maxAge: 15 * 60 * 1000,
  path:'/'
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'None' : 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path:'/'
});

};



// ✅ Controller: Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) throw new CustomError(error.details[0].message, 400);

  const { name, email, password, timezone } = req.body;

  await registerUserService({ name, email, password, timezone });

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: "OTP sent to email. Please verify to complete registration.",
  });
});



// ✅ Login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userLoginServices(email, password);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  sendTokensAsCookies(res, accessToken, refreshToken);

  res.status(200).json({
    status: STATUS.SUCCESS,
    message: "User login successful",
    user,
  });
});

// ✅ Refresh Access Token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new CustomError("Refresh token missing", 401);

  const { newAccessToken } = await refreshAccessTokenService(refreshToken);

  const isProd = process.env.NODE_ENV === 'production';

  res
  .cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 15 * 60 * 1000,
    path:'/'
  })
  .status(200)
  .json({
    status: STATUS.SUCCESS,
    message: "Access token refreshed",
    
  });

});

// ✅ Get Logged-In User
export const getLoggedInUser = asyncHandler(async (req, res) => {
  const user = await getUserDetails(req.user._id);
  if (!user) throw new CustomError("User not found", 404);

  res.status(200).json({ user });
});

// ✅ Logout
export const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService(); 

  const isProd = process.env.NODE_ENV === 'production';

res
  .clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  })
  .clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/",
  })
  .status(200)
  .json({ message: "Logged out successfully" });
});



export const verifyOTPController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new CustomError('Email and OTP are required', 400);

  const newUser = await verifyOtpAndRegisterService(email, otp);

  res.status(201).json({
    status: STATUS.SUCCESS,
    message: "OTP verified, user registered successfully",
    user: newUser,
  });
});




export const checkEmailExists = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new CustomError("Email is required", 400);
  }

  const exists = await checkEmailExistsService(email);

  res.status(200).json({ exists });
});



export const resendOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError('Email is required', 400);

  await resendOtpService(email);

  res.status(200).json({ message: 'OTP resent successfully' });
});

// 🔐 Forgot Password - Send OTP
export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError('Email is required', 400);

  await forgotPasswordService(email);

  res.status(200).json({
    message: 'OTP sent to your email. Please use it to reset your password.',
  });
});

// 🔒 Reset Password
export const resetPasswordController = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new CustomError('All fields are required', 400);

  await resetPasswordService(email, otp, newPassword);

  res.status(200).json({ message: 'Password reset successful. You can now log in.' });
});