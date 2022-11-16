import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Select from 'react-select';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setCalendars, setCurDate, setRepresentation } from '../store/slices/calendarsSlice';
import PopUpGetCalendarInfo from "../popups/PopUpGetCalendarInfo";
import { SERVER_URL } from "../const";
import moment from 'moment';


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

    const representationOptions = [
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' }
    ];

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

            <div>
                <div onClick={goBack}>
                    <iconify-icon icon="material-symbols:arrow-back-ios-rounded" />
                </div>
                <div onClick={goForward}>
                    <iconify-icon icon="material-symbols:arrow-forward-ios-rounded" />
                </div>
            </div>

            <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                    label="Responsive"
                    openTo="day"
                    views={['year', 'month', 'day']}
                    value={curCalendars.curDate}
                    onChange={changeCurDate}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>

            <div className='status_select_contatiner'>
                <div className='label'>Representation:</div>
                <Select value={getRepresentationValue()} options={representationOptions} 
                        onChange={handleChangeRepresentation} className='status_select' classNamePrefix='status_select' />
            </div>
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

    function changeCurDate(date) {
        dispatch(setCurDate({ 
            curDate: date
        }));
        window.location.reload();
    }

    function goBack() {
        changeCurDate(moment(curCalendars.curDate).subtract(1, "weeks"));
    }
    
    function goForward() {
        changeCurDate(moment(curCalendars.curDate).add(1, "weeks"));
    }

    function getRepresentationValue() {
        return representationOptions.find(option => option.value == curCalendars.representation);
    }

    function handleChangeRepresentation(event) {
        dispatch(setRepresentation({ representation: event.value }));
        window.location.reload();
    }
}

export default Sidebar;

