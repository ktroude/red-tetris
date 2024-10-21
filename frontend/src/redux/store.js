import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './socketSlice';

const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
});

export default store;
