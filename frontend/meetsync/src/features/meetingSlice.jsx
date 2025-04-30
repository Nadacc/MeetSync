import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';


export const createMeeting = createAsyncThunk(
    'meeting/create',
    async (meetingData, { rejectWithValue }) => {
      try {
        console.log("Creating meeting with data:", meetingData); 
        const res = await axiosInstance.post('/meetings/create', meetingData);
        return res.data.meeting;
      } catch (err) {
        console.error("Create meeting error:", err);
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
    async ({ id, meeting }, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.patch(`/meetings/update/${id}`, meeting);
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

  export const fetchMeetingById = createAsyncThunk(
    'meetings/fetchMeetingById',
    async (meetingId, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`/meetings/${meetingId}`);
        return response.data.meeting || response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
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
    refreshNeeded:false
  },
  reducers: {
    refreshNeeded: (state) => {
      state.refreshNeeded = true;
    },
    clearRefreshNeeded: (state) => {
      state.refreshNeeded = false;
    }
  },
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
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.created.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.created[index] = action.payload;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.created = state.created.filter(m => m._id !== action.payload);
      })
      .addCase(fetchMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeeting = action.payload;
      })
      .addCase(fetchMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});


export const { refreshNeeded, clearRefreshNeeded } = meetingSlice.actions;
export default meetingSlice.reducer;
