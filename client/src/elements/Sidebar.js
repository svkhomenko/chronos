import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setCalendars } from '../store/slices/calendarsSlice';
import { SERVER_URL } from "../const";

function Sidebar() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

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
            dispatch(setCalendars({ 
                calendars: data.map(calendar => ({
                    ...calendar,
                    active: calendar.status == "main"
                })) 
            }));
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
                curCalendars.calendars.map(calendar => (
                    <div key={calendar.id}>
                        <input type="checkbox" className="status_checkbox"
                                id={`checkbox_calendar_${calendar.id}`} name={`checkbox_calendar_${calendar.id}`} 
                                checked={calendar.active} onChange={() => {handleChangeActiveCalendar(calendar.id)}} />
                        <label htmlFor={`checkbox_calendar_${calendar.id}`} className="status_label">
                            {calendar.name}
                        </label>
                    </div>
                ))
            }
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
    }
}

export default Sidebar;

