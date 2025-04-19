import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';


export const createMeeting = createAsyncThunk(
    'meeting/create',
    async (meetingData, { rejectWithValue }) => {
      try {
        console.log("Creating meeting with data:", meetingData); // 👈 Check what is being sent
        const res = await axiosInstance.post('/meetings/create', meetingData);
        return res.data.meeting;
      } catch (err) {
        console.error("Create meeting error:", err); // 👈 More helpful logging
        return rejectWithValue(err.response?.data?.message || "Unknown error");
      }
    }
  );
  
  export const fetchMeetings = createAsyncThunk(
    'meeting/fetchMeetings',
    async (_, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.get('/meetings/user');
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error fetching meetings');
      }
    }
  );


  export const updateMeeting = createAsyncThunk(
    'meeting/update',
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.put(`/meetings/update/${id}`, data);
        return res.data.meeting;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Update failed");
      }
    }
  );
  
  export const deleteMeeting = createAsyncThunk(
    'meeting/delete',
    async (id, { rejectWithValue }) => {
      try {
        await axiosInstance.delete(`/meetings/delete/${id}`);
        return id;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Delete failed");
      }
    }
  );
  
  
const meetingSlice = createSlice({
  name: 'meeting',
  initialState: {
    created: [],
    invited: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.created.push(action.payload); 
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.created = action.payload.created;
        state.invited = action.payload.invited;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        const index = state.created.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.created[index] = action.payload;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.created = state.created.filter(m => m._id !== action.payload);
      })
      
  },
});

export default meetingSlice.reducer;
