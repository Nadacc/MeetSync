import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { getStreamClient } from '../components/Video/StreamClientProvider';

export const createMeetingCall = createAsyncThunk(
  'stream/createMeetingCall',
  async (meetingData, { rejectWithValue }) => {
    try {
      if (!meetingData.userId) {
        return rejectWithValue('Missing userId');
      }
      
      const response = await axiosInstance.post('/stream/create-call', meetingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create meeting call');
    }
  }
);

const streamSlice = createSlice({
  name: 'stream',
  initialState: {
    clientInitialized: false,
    currentCall: null,
    loading: false,
    error: null,
  },
  reducers: {
    setClientInitialized: (state, action) => {
      state.clientInitialized = action.payload;
    },
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
    },
    clearCurrentCall: (state) => {
      state.currentCall = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMeetingCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeetingCall.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCall = action.payload;
      })
      .addCase(createMeetingCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setClientInitialized, setCurrentCall, clearCurrentCall } = streamSlice.actions;
export default streamSlice.reducer;
