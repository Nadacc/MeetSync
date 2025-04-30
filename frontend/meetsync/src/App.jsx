import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

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
import { Toaster } from 'react-hot-toast';
import { StreamClientProvider } from './components/Video/StreamClientProvider';
import CallProvider from './components/Video/CallProvider';
import MeetingEnded from './components/MeetingEnded';
//import CallPage from './components/Video/CallPage';

function App() {
  const dispatch = useDispatch();
  const authChecked = useAuthCheck();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      dispatch(fetchUserDetails());
    }
  }, [dispatch, authChecked, isAuthenticated]);

  // if (!authChecked || loading) {
  //   return <Loader />;
  // }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <StreamClientProvider>
      <>
        <Toaster position='top-right'/>
        <Routes>
          
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />
          } />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          
          <Route path="/app/*" element={<PrivateRoute><HomeLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-meeting" element={<CreateMeeting />} />
            <Route path="meetings" element={<Meeting />} />
            <Route path="calender" element={<MainCalendar />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/call/:callId" element={<PrivateRoute><CallProvider /></PrivateRoute>} />
          {/* <Route path="/call/:callId" element={<PrivateRoute><CallPage/></PrivateRoute>} /> */}
          <Route path="/meeting-ended" element={<PrivateRoute><MeetingEnded/></PrivateRoute>}/>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
      </StreamClientProvider>
    </GoogleOAuthProvider>
    
  );
}

export default App
