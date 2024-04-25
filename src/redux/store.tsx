import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import generalReducer from './generalSlice';

const store: EnhancedStore = configureStore({
  reducer: {
    general: generalReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
