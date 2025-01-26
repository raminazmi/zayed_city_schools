import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: localStorage.getItem('language') || "ar",
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.current = action.payload;
      localStorage.setItem('language', state.current);

    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;