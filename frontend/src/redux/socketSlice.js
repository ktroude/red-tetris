import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socketInstance: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socketInstance = action.payload;
    },
    disconnectSocket: (state) => {
      state.socketInstance = null;
    },
  },
});

export const { setSocket, disconnectSocket } = socketSlice.actions;
export default socketSlice.reducer;
