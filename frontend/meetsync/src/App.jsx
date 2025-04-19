import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';
import Home from './Pages/HomeLayout';
import { fetchUserDetails } from './features/authSlice';
import VerifyOtp from './Pages/Auth/VerifyOtp';
import ForgotPassword from './Pages/Auth/ForgetPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './components/LandingPage';
import NotFound from './Pages/NotFound';
import PublicRoute from './Routes/PublicRoute';
import useAuthCheck from './hooks/useAuthCheck';
import Loader from './components/Loader';
import PrivateRoute from './Routes/PrivateRoute';
import CreateMeeting from './components/CreateMeeting';
import MainCalendar from './components/MainCalender';
import Dashboard from './components/Dashboard';
import Meeting from './components/Meeting';
import HomeLayout from './Pages/HomeLayout';
import Profile from './Pages/Profile';

function App() {
  const dispatch = useDispatch();
  const authChecked = useAuthCheck();

  useEffect(() => {
    if (authChecked) {
      dispatch(fetchUserDetails());
    }
  }, [dispatch, authChecked]);

  return (
    <GoogleOAuthProvider clientId="108553417296-qcesv6mn9pl6kjoska92s77158e64lql.apps.googleusercontent.com">
      <ToastContainer />
      <Routes>
        
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/landing-page" element={<LandingPage />} />

        
        <Route path="/" element={<PrivateRoute><HomeLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-meeting" element={<CreateMeeting />} />
          <Route path="meetings" element={<Meeting />} />
          <Route path="calender" element={<MainCalendar />} />
          <Route path="profile" element={<Profile/>}/>
        </Route>

        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App
