import { createSlice } from '@reduxjs/toolkit';

// Load persisted auth from localStorage
const loadAuthState = () => {
  try {
    const stored = localStorage.getItem('swagat_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: true,
        tempMobile: null,
        tempUserData: null
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    user: null,
    isAuthenticated: false,
    tempMobile: null,
    tempUserData: null
  };
};

const initialState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTempMobile: (state, action) => {
      state.tempMobile = action.payload;
    },
    setTempUserData: (state, action) => {
      state.tempUserData = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.tempMobile = null;
      state.tempUserData = null;
      // Persist to localStorage
      localStorage.setItem('swagat_auth', JSON.stringify({ user: action.payload }));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('swagat_auth');
    },
    clearTemp: (state) => {
      state.tempMobile = null;
      state.tempUserData = null;
    }
  }
});

export const { setTempMobile, setTempUserData, loginSuccess, logout, clearTemp } = authSlice.actions;
export default authSlice.reducer;
