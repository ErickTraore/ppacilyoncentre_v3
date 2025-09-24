// src/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import messageReducer from './reducers/messageReducer';
import userReducer from './reducers/userReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    user: userReducer,
  }
});

export default store;

