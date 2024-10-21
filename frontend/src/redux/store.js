import { configureStore } from '@reduxjs/toolkit';
import socketReducer from './socketSlice';

const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Désactiver la vérification des objets sérialisables
    }),
});

export default store;
