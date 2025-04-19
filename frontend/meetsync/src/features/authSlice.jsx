import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom';

//import Cookies from 'js-cookie'


export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        '/users/login',
        { email, password },
        //{ withCredentials: true }
      );
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Invalid email or password");
      }
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

  export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
      try {
        console.log("Sending data to /register", userData);
        const res = await axiosInstance.post('/users/register', userData);
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
        const res = await axiosInstance.post('/users/verify-otp', { email, otp });
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
        const response = await axiosInstance.get('/users/me');
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
        await axiosInstance.post('/users/logout');
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
        const res = await axiosInstance.post('/users/resend-otp', { email });
        return res.data.message;
      } catch (err) {
        return rejectWithValue({
          message: err?.response?.data?.message || err.message || 'Failed to resend OTP',
        });
      }
    }
  );

 
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/users/forgot-password", { email });
      console.log(res.data.message);
    } catch (err) {
      console.log(err.response?.data?.message || "Something went wrong");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (formData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/users/reset-password", formData);
      console.log(res.data.message);
    } catch (err) {
      console.log(err.response?.data?.message || "Something went wrong");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error.response?.data);
      return rejectWithValue(error.response?.data);
    }
  }
);

  

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated:false,
    authChecked: false,
  },
  reducers: {
    
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload;
      state.authChecked = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authChecked = true; // ✅ Still mark it as checked
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    
  },
  extraReducers: (builder) => {
    builder
      
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
        state.error = action.payload || action.error.message;
      })

      
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = { email: action.payload.email } 
        state.isAuthenticated = false 
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
        state.isAuthenticated = false;
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
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;  
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      });
  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer
