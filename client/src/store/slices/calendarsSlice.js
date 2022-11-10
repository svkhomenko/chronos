import { buildExternalHelpers } from '@babel/core';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    calendars: []
}

export const calendarsSlice = createSlice({
    name: 'calendars',
    initialState,
    reducers: {
        setCalendars: (state, action) => {
            state.calendars = action.payload.calendars;
        },
        removeCalendars(state) {
            state.calendars = [];
        }
    }
});

export const { setCalendars, removeCalendars } = calendarsSlice.actions;
export default calendarsSlice.reducer;

