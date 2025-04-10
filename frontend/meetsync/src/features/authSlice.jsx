import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

//import Cookies from 'js-cookie'

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        '/login',
        { email, password },
        //{ withCredentials: true }
      );
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Invalid email or password");
      }
      throw new Error(err.response?.data?.message || "Login failed");
    }
  }
);

  
  

  export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
      try {
        console.log("Sending data to /register", userData);
        const res = await axiosInstance.post('/register', userData);
        console.log("Register response", res.data);
        return { message: res.data.message, email: userData.email };
      } catch (err) {
        console.error("Register error", err);
        return rejectWithValue({
          message: err?.response?.data?.message || err.message || 'Signup failed',
        });
      }
    }
  );
  
  
  export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post('/verify-otp', { email, otp });
        return res.data.user;
      } catch (err) {
        return rejectWithValue({
          message: err?.response?.data?.message || err.message || 'OTP verification failed',
        });
      }
    }
  );
  

  export const fetchUserDetails = createAsyncThunk(
    "auth/fetchUserDetails",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get('/me');
        console.log(response.data.user);
        return response.data.user;
      } catch (error) {
        if (error.response?.status === 401) {
          return rejectWithValue("Please login with your credentials");
        }
        return rejectWithValue(
          error.response?.data?.message || "Error in logined person"
        );
      }
    }
  );
  
  export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
      try {
        await axiosInstance.post('/logout');
        return;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || "Error in logout"
        );
      }
    }
  );

  export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async ({ email }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post('/resend-otp', { email });
        return res.data.message;
      } catch (err) {
        return rejectWithValue({
          message: err?.response?.data?.message || err.message || 'Failed to resend OTP',
        });
      }
    }
  );

  // Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/forgot-password", { email });
      console.log(res.data.message);
    } catch (err) {
      console.log(err.response?.data?.message || "Something went wrong");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (formData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/reset-password", formData);
      console.log(res.data.message);
    } catch (err) {
      console.log(err.response?.data?.message || "Something went wrong");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

  

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated:false
  },
  reducers: {
    
    setUser: (state, action) => {
      state.user = action.payload
    },
    clearAuthError: (state) => {
      state.error = null;
    }
    
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.error=null
        state.isAuthenticated=true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message;
      })

      // Signup
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = { email: action.payload.email } // <-- Set just the email
        state.isAuthenticated = false // not yet authenticated until OTP
      })
      
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Signup failed'
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true; 
      })
      
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      
      

  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer
