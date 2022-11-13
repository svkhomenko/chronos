import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setCalendars } from '../store/slices/calendarsSlice';
import PopUpGetCalendarInfo from "../popups/PopUpGetCalendarInfo";
import { SERVER_URL } from "../const";

function Sidebar() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpGetCalendarInfoOpen, setIsPopUpGetCalendarInfoOpen] = useState(false);
    const [calendarForPopupGetCalendarInfo, setCalendarForPopupGetCalendarInfo] = useState();

    useEffect(() => {
        fetch(SERVER_URL + `/api/calendars`, 
        {
            method: 'GET',
            headers: {
                'authorization': curUser.token
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then((data) => {
            let activeCalendar = curCalendars.calendars.filter(calendar => calendar.active);
            if (activeCalendar.length == 0) {
                dispatch(setCalendars({ 
                    calendars: data.map(calendar => ({
                        ...calendar,
                        active: calendar.status == "main"
                    })) 
                }));
            }
            else {
                dispatch(setCalendars({ 
                    calendars: data.map(calendar => ({
                        ...calendar,
                        active: !!(activeCalendar.find(c => c.id == calendar.id))
                    })) 
                }));
            }
        })
        .catch((err) => {
            console.log('err', err, err.body);
            switch(err.status) {
                case 401:
                    dispatch(removeUser());
                    window.location.href = '/login';
                    break;
                default:
                    window.location.href = '/error';
            }
        });
    }, []);

    return (
        <div>
            {
                isPopUpGetCalendarInfoOpen &&
                <PopUpGetCalendarInfo calendar={calendarForPopupGetCalendarInfo} setIsPopUpOpen={setIsPopUpGetCalendarInfoOpen} />
            }
            {
                curCalendars.calendars.map(calendar => (
                    <div key={calendar.id}>
                        <input type="checkbox" className="status_checkbox"
                                id={`checkbox_calendar_${calendar.id}`} name={`checkbox_calendar_${calendar.id}`} 
                                checked={calendar.active} onChange={() => {handleChangeActiveCalendar(calendar.id)}} />
                        <label htmlFor={`checkbox_calendar_${calendar.id}`} className="status_label">
                            {calendar.name}
                        </label>
                        <div onClick={() => {setIsPopUpGetCalendarInfoOpen(true);setCalendarForPopupGetCalendarInfo(calendar);}}>
                            <iconify-icon icon="ep:info-filled" />
                        </div>
                    </div>
                ))
            }
            <Link to={'/create_event'}>Create event</Link>
            <Link to={'/create_calendar'}>Create calendar</Link>
        </div>
    );
    
    function handleChangeActiveCalendar(calendarId) {
        dispatch(setCalendars({ 
            calendars: curCalendars.calendars.map(calendar => {
                if (calendar.id == calendarId) {
                    return {
                        ...calendar,
                        active: !calendar.active
                    }
                }
                else {
                    return calendar;
                }
            }) 
        }));
        window.location.reload();
    }
}

export default Sidebar;

