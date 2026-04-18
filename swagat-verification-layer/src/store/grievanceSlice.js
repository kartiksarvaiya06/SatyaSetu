import { createSlice } from '@reduxjs/toolkit';
import { grievances as mockGrievances } from '../mockData/grievances';

const initialState = {
  items: mockGrievances,
  loading: false,
  error: null
};

const grievanceSlice = createSlice({
  name: 'grievances',
  initialState,
  reducers: {
    addGrievance: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateGrievanceStatus: (state, action) => {
      const { id, status, resolution } = action.payload;
      const grievance = state.items.find(g => g.id === id);
      if (grievance) {
        grievance.status = status;
        if (resolution) {
          grievance.resolutionAttempts.push(resolution);
        }
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { addGrievance, updateGrievanceStatus, setLoading } = grievanceSlice.actions;
export default grievanceSlice.reducer;
