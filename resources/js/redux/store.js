import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@redux/themeSlice';
import languageReducer from '@redux/languageSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    language: languageReducer,
  },
});

export default store;

