import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { removeUser } from '../store/slices/userSlice';
// import { setScrollToY, removeScrollToY } from '../store/slices/calendarsSlice';
import moment from 'moment';
// import { Rnd } from 'react-rnd';
// import { SERVER_URL } from "../const";
// import PopUpCreateEvent from "../popups/PopUpCreateEvent";
// import PopUpGetEventInfo from "../popups/PopUpGetEventInfo";
// import { fillArray, getHolidaysOnDate, isAllDay, updateEvent } from "./calendars_tools";
// import isoToGcalDescription from "../tools/isoToGcalDescription";

function Month() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [month, setMonth] = useState(getDates());

    return (
        <div className='month'>
            Month
        </div>
    );

    function getDates() {
        let start = moment(curCalendars.curDate).startOf('isoMonth').startOf('isoWeek').startOf('day');
        let end = moment(curCalendars.curDate).endOf('isoMonth').endOf('isoWeek').startOf('day');
        let month = [];
        while (start !== end) {
            month.push(start.format('llll'));
            start.add(1, "days");
        }
        console.log(month);
        return month;
    }
}

export default Month;

