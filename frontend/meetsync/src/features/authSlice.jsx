import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../api/axiosInstance'

//import Cookies from 'js-cookie'

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post('/login', credentials);
        const { user } = res.data;
        return { user };
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || 'Login failed';
        return rejectWithValue({ message });
      }
    }
  );
  
  

  export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.post('/register', userData);
        const { user } = res.data; // token removed
        return { user };
      } catch (err) {
        return rejectWithValue({
          message: err?.response?.data?.message || err.message || 'Signup failed',
        });
      }
    }
  );
  
  

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.loading = false
      state.error = null
      Cookies.remove('token')
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'login failed'
      })

      // Signup
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Signup failed'
      })
  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer
