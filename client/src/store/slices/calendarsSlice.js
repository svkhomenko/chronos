import { buildExternalHelpers } from '@babel/core';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    calendars: [],
    scrollToY: 0,
    message: ''
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
        },
        setScrollToY: (state, action) => {
            state.scrollToY = action.payload.scrollToY;
        },
        removeScrollToY(state) {
            state.scrollToY = 0;
        },
        setMessage: (state, action) => {
            state.message = action.payload.message;
        },
        removeMessage(state) {
            state.message = '';
        }
    }
});

export const { setCalendars, removeCalendars, setScrollToY, removeScrollToY, setMessage, removeMessage } = calendarsSlice.actions;
export default calendarsSlice.reducer;

