import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

interface LocationState {
  currentLocation: Location | null;
  isLocationEnabled: boolean;
  locationPermission: 'granted' | 'denied' | 'prompt';
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isLocationEnabled: false,
  locationPermission: 'prompt',
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.isLocationEnabled = true;
      state.error = null;
    },
    setLocationPermission: (state, action: PayloadAction<'granted' | 'denied' | 'prompt'>) => {
      state.locationPermission = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    disableLocation: (state) => {
      state.isLocationEnabled = false;
      state.currentLocation = null;
    },
  },
});

export const { setLoading, setCurrentLocation, setLocationPermission, setError, disableLocation } = locationSlice.actions;
export default locationSlice.reducer; 