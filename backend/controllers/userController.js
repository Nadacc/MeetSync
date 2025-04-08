import asyncHandler from '../utils/asyncHandler.js';
import STATUS from '../utils/constants.js';
import {
  userRegisterServices,
  userLoginServices,
  getUserDetails,
  logoutUserService,
  refreshAccessTokenService
} from '../services/userService.js';
import registerValidation from '../validation/userValidation.js';
import User from '../models/userModel.js';
import CustomError from '../utils/customError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

// Register
// Register
export const registerUser = asyncHandler(async (req, res) => {
    const data = req.body;
    const { error } = registerValidation.validate(data);
    if (error) throw new CustomError(error.details[0].message, 400);
  
    const newUser = await userRegisterServices(data);
  
    res.status(201).json({
      status: STATUS.SUCCESS,
      message: "User registered successfully",
      user: newUser,
    });
  });
  

// Login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("Received", email, password);

  // Optional: Add validation here
  const user = await userLoginServices(email, password);

  const accessToken = generateAccessToken(user);
  console.log(accessToken);

  const refreshToken = generateRefreshToken(user);
  console.log(refreshToken);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .status(200)
    .json({
      status: STATUS.SUCCESS,
      message: "user login successfully",
      user: user
    });
});

// Refresh token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  const { newAccessToken } = await refreshAccessTokenService(refreshToken);

  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
    })
    .status(200)
    .json({
      status: STATUS.SUCCESS,
      message: "Access token refreshed"
    });
});

// Get logged-in user
export const getLoggedInUser = asyncHandler(async (req, res) => {
  const user = await getUserDetails(req.user._id);
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  res.status(200).json({ user });
});

// Logout
export const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService();

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: '/'
  });

  res.status(200).json({ message: 'Logged out successfully' });
});
