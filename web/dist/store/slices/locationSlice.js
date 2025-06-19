import { createSlice } from '@reduxjs/toolkit';
const initialState = {
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
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCurrentLocation: (state, action) => {
            state.currentLocation = action.payload;
            state.isLocationEnabled = true;
            state.error = null;
        },
        setLocationPermission: (state, action) => {
            state.locationPermission = action.payload;
        },
        setError: (state, action) => {
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
