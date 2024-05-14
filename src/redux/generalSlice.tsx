import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

interface GeneralState {
  isDeviceOwner: boolean;
  isVotingsSyncing: boolean;
  isSurveyTestMode: boolean;
}

const initialState: GeneralState = {
  isDeviceOwner: false,
  isVotingsSyncing: false,
  isSurveyTestMode: false
};

export const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    setIsDeviceOwner: (state, action: PayloadAction<boolean>) => {
      state.isDeviceOwner = action.payload;
    },
    setIsVotingsSyncing: (state, action: PayloadAction<boolean>) => {
      state.isVotingsSyncing = action.payload;
    },
    setIsSurveyTestMode: (state, action: PayloadAction<boolean>) => {
      state.isSurveyTestMode = action.payload;
    }
  }
});

export const { setIsDeviceOwner, setIsVotingsSyncing, setIsSurveyTestMode } = generalSlice.actions;

export const selectIsDeviceOwner = (state: RootState) => state.general.isDeviceOwner;
export const selectIsVotingsSyncing = (state: RootState) => state.general.isVotingsSyncing;
export const selectIsSurveyTestMode = (state: RootState) => state.general.isSurveyTestMode;

export default generalSlice.reducer;
