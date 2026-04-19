import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:5000/api/grievances';

// Async Thunks
export const fetchUserGrievances = createAsyncThunk(
  'grievances/fetchUser',
  async (mobile) => {
    const response = await fetch(`${API_BASE}/citizen/${mobile}`);
    return await response.json();
  }
);

export const fetchDeptGrievances = createAsyncThunk(
  'grievances/fetchDept',
  async (department) => {
    const response = await fetch(`${API_BASE}/dept/${department}`);
    return await response.json();
  }
);

export const fetchFieldTasks = createAsyncThunk(
  'grievances/fetchField',
  async (department) => {
    const response = await fetch(`${API_BASE}/field/${department}`);
    return await response.json();
  }
);

export const fetchCollectorStats = createAsyncThunk(
  'grievances/fetchCollector',
  async () => {
    const response = await fetch(`${API_BASE}/collector/stats`);
    return await response.json();
  }
);

export const updateGrievanceAction = createAsyncThunk(
  'grievances/updateStatus',
  async ({ id, status, resolutionNote, officerId }) => {
    const response = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNote, officerId })
    });
    return await response.json();
  }
);

export const submitVerificationAction = createAsyncThunk(
  'grievances/submitVerify',
  async ({ id, formData }) => {
    const response = await fetch(`${API_BASE}/${id}/verify`, {
      method: 'POST',
      body: formData // Multipart
    });
    return await response.json();
  }
);

const initialState = {
  items: [],
  completedTasks: [],
  collectorData: null,
  loading: false,
  error: null,
  // EXIF metadata store
  citizenMetadata: null,   // { lat, lng, timestamp, submittedAt }
  officerMetadata: null,   // { lat, lng, timestamp }
};

const grievanceSlice = createSlice({
  name: 'grievances',
  initialState,
  reducers: {
    addGrievance: (state, action) => {
      state.items.unshift(action.payload);
    },
    clearGrievances: (state) => {
      state.items = [];
    },
    setCitizenMetadata: (state, action) => {
      // action.payload: { lat, lng, timestamp, submittedAt }
      state.citizenMetadata = action.payload;
    },
    setOfficerMetadata: (state, action) => {
      state.officerMetadata = action.payload;
    },
    clearExifMetadata: (state) => {
      state.citizenMetadata = null;
      state.officerMetadata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUserGrievances.pending, (state) => { state.loading = true; })
      .addCase(fetchUserGrievances.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      // Fetch Dept
      .addCase(fetchDeptGrievances.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      // Fetch Field
      .addCase(fetchFieldTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.tasks || [];
        state.completedTasks = action.payload.completed || [];
      })
      // Fetch Collector
      .addCase(fetchCollectorStats.fulfilled, (state, action) => {
        state.loading = false;
        state.collectorData = action.payload;
      })
      // Update Status
      .addCase(updateGrievanceAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(g => g.grievanceId === action.payload.grievanceId);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Submit Verify
      .addCase(submitVerificationAction.fulfilled, (state, action) => {
        // Remove from pending list
        state.items = state.items.filter(g => g.grievanceId !== action.payload.grievanceId);
        // Add to completed list for immediate UI feedback
        const exists = state.completedTasks.find(g => g.grievanceId === action.payload.grievanceId);
        if (!exists) {
          state.completedTasks.unshift(action.payload);
        }
      });
  }
});

export const { addGrievance, clearGrievances, setCitizenMetadata, setOfficerMetadata, clearExifMetadata } = grievanceSlice.actions;
export default grievanceSlice.reducer;
