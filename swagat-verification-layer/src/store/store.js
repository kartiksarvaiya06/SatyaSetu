import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import grievanceReducer from './grievanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer
  }
});
