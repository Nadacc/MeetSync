import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import CustomError from '../utils/customError.js';
import { generateAccessToken, verifyToken } from '../utils/jwt.js';

// Registration
export const userRegisterServices = async (data) => {
  const userExist = await User.findOne({ email: data.email });
  if (userExist) {
    throw new CustomError("User already exists", 400);
  }

  const hashPassword = await bcrypt.hash(data.password, 10);
  const newUser = new User({
    name: data.name,
    email: data.email,
    password: hashPassword,
    timezone:data.timezone
    
    
  });

  const savedUser = await newUser.save();
  return savedUser;
};

export const userLoginServices = async (email, password) => {
  const userData = await User.findOne({ email });
  if (!userData) {
    throw new CustomError("Invalid email or Password", 401);
  }

  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    throw new CustomError("Invalid Email or Password", 401);
  }

  if (userData.isBlock) {
    throw new CustomError("Your account is blocked. Please contact Admin.", 403);
  }

  return userData;
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
