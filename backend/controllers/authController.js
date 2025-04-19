import asyncHandler from '../utils/asyncHandler.js';
import { googleAuthService } from '../services/authService.js';
import { sendTokensAsCookies } from '../utils/tokenHandler.js';

export const googleLogin = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await googleAuthService(req.query.code);
  sendTokensAsCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    message: 'Google login successful',
    user,
  });
});
