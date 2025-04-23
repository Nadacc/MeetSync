import { useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { setUser, logout } from '../features/authSlice';

const useAuthCheck = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const dispatch = useDispatch();
  
    useLayoutEffect(() => {
      console.log("Checking auth...");
      const checkAuth = async () => {
        try {
          const res = await axiosInstance.get('/users/me');
          dispatch(setUser(res.data.user));  
        } catch (error) {
          dispatch(logout());  
          console.log("Error while checking auth:", error);
        } finally {
          setAuthChecked(true);  
        }
      };
  
      checkAuth();
    }, [dispatch]);
  
    return authChecked; 
  };
  

export default useAuthCheck;
