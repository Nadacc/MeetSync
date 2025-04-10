import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import CustomError from '../utils/customError.js';
import { generateAccessToken, verifyToken } from '../utils/jwt.js';
import { generateOTP } from '../utils/otp.js';
import { saveOTP,verifyAndConsumeOTP } from '../utils/otpStore.js';
import sendOTPEmail from '../utils/sendMail.js';
import otpTemplate from '../utils/emailTemplates/otpTemplate.js';

// Registration
export const registerUserService = async ({ name, email, password, timezone }) => {
  const userExists = await checkEmailExistsService(email);
  if (userExists) {
    throw new CustomError("User already exists", 400);
  }

  const otp = generateOTP();

  // Save OTP and temporary user data
  saveOTP(email, otp, { name, email, password, timezone });

  // Send OTP to user's email
  await sendOTPEmail({
    to: email,
    subject: 'Verify your email - OTP Code',
    html: otpTemplate(otp),
  });
};

const userRegisterServices = async ({ name, email, password, timezone }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    timezone,
  });

  return newUser;
};


export const userLoginServices = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomError("Invalid email or password", 401);
  }

  return user;
};

export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new CustomError("Refresh token missing", 401);
  }

  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (!decoded) {
    throw new CustomError("Invalid or expired refresh token", 403);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const newAccessToken = generateAccessToken(user);
  return { newAccessToken };
};



export const getUserDetails = async (id) => {
  const user = await User.findById(id);
  return user;
};



export const logoutUserService = () => {
  return true;
};



export const checkEmailExistsService = async (email) => {
  const user = await User.findOne({ email });
  return !!user; // returns true if user exists, false otherwise
};

export const verifyOtpAndRegisterService = async (email, otp) => {
  const { valid, userData, reason } = verifyAndConsumeOTP(email, otp);

  if (!valid) throw new CustomError(reason, 400);
  if (!userData) throw new CustomError("User data not found with OTP", 400);

  const newUser = await userRegisterServices(userData);
  return newUser;
};


export const resendOtpService = async (email) => {
  const otp = generateOTP();
  saveOTP(email, otp); // no userData needed here
  await sendOTPEmail({
    to: email,
    subject: 'Resend OTP - Verification Code',
    html: otpTemplate(otp),
  });
};

// 🔐 Forgot Password Service
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new CustomError("No account with this email", 404);

  const otp = generateOTP();
  saveOTP(email, otp); // just OTP, no userData
  await sendOTPEmail({
    to: email,
    subject: 'Password Reset - OTP Code',
    html: otpTemplate(otp),
  });
};

// 🔒 Reset Password Service
export const resetPasswordService = async (email, otp, newPassword) => {
  const { valid, reason } = verifyAndConsumeOTP(email, otp);
  if (!valid) throw new CustomError(reason, 400);

  const user = await User.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
};
