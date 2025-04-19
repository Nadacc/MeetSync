import React from 'react';
import Button from '../../components/ui/Button';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance, { googleAuth } from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/authSlice';
import { FcGoogle } from 'react-icons/fc'

function GoogleLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        console.log(authResult.code)
        await googleAuth(authResult.code);

        
        const userRes = await axiosInstance.get('/users/me'); 
        dispatch(setUser(userRes.data.user)); 
        navigate('/');
      }
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code'
  });

  return (
    <div className="flex justify-center">
      <Button onClick={() => googleLogin()} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full py-2 px-4 shadow-sm hover:shadow-md hover:bg-gray-300 transition duration-200">
        <FcGoogle size={22} />
        <span className="text-sm font-medium text-gray-700 cursor-pointer">Login with Google</span>
      </Button>
    </div>
  );
}

export default GoogleLogin;
