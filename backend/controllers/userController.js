import asyncHandler from '../utils/asyncHandler.js';
import STATUS from '../utils/constants.js';
import { sendTokensAsCookies } from '../utils/tokenHandler.js';


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
  verifyOtpAndRegisterService,
  updateUserProfileService
} from '../services/userService.js';
import registerValidation from '../validation/userValidation.js';
import CustomError from '../utils/customError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';


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



export const getLoggedInUser = asyncHandler(async (req, res) => {
  const user = await getUserDetails(req.user._id);
  if (!user) throw new CustomError("User not found", 404);

  res.status(200).json({ user });
});



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

  const user = await checkEmailExistsService(email);

  if (!user) {
    return res.status(404).json({ message: "User not found", exists: false });
  }

  // Prevent Google user from resetting password
  if (user.isGoogleUser) {
    return res.status(400).json({ message: "Google user can't reset password", isGoogleUser: true });
  }

  res.status(200).json({ exists: true, isGoogleUser: false });
});




export const resendOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError('Email is required', 400);

  await resendOtpService(email);

  res.status(200).json({ message: 'OTP resent successfully' });
});



export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new CustomError('Email is required', 400);

  await forgotPasswordService(email);

  res.status(200).json({
    message: 'OTP sent to your email. Please use it to reset your password.',
  });
});



export const resetPasswordController = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new CustomError('All fields are required', 400);

  await resetPasswordService(email, otp, newPassword);

  res.status(200).json({ message: 'Password reset successful. You can now log in.' });
});



export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, timezone } = req.body;
    console.log("Uploaded File Info:", req.file); // Check the file data
    console.log("Form Data:", req.body); // Log the rest of the form data

    const profilePic = req.file?.path; // The path to the uploaded file

    const updatedData = {
      ...(name && { name }),
      ...(timezone && { timezone }),
      ...(profilePic && { profilePic }),
    };

    const updatedUser = await updateUserProfileService(userId, updatedData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error); // Log error details
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

