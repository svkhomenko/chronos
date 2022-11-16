import { buildExternalHelpers } from '@babel/core';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    calendars: [],
    scrollToY: 0,
    message: '',
    curDate: new Date(),
    representation: "week"
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
        },
        setCurDate: (state, action) => {
            state.curDate = action.payload.curDate;
        },
        removeCurDate(state) {
            state.curDate = new Date();
        },
        setRepresentation: (state, action) => {
            state.representation = action.payload.representation;
        },
        removeRepresentation(state) {
            state.representation = "week";
        }
    }
});

export const { setCalendars, removeCalendars, setScrollToY, removeScrollToY, setMessage, removeMessage, setCurDate, removeCurDate, setRepresentation, removeRepresentation } = calendarsSlice.actions;
export default calendarsSlice.reducer;

