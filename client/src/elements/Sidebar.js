import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Select from 'react-select';
import moment from 'moment';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSelector, useDispatch } from 'react-redux';
import { setCalendars, setCurDate, removeCurDate, setRepresentation } from '../store/slices/calendarsSlice';
import PopUpGetCalendarInfo from "../popups/PopUpGetCalendarInfo";

function Sidebar() {
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpGetCalendarInfoOpen, setIsPopUpGetCalendarInfoOpen] = useState(false);
    const [calendarForPopupGetCalendarInfo, setCalendarForPopupGetCalendarInfo] = useState();

    const representationOptions = [
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' }
    ];

    return (
        <div>
            {
                isPopUpGetCalendarInfoOpen &&
                <PopUpGetCalendarInfo curCalendar={calendarForPopupGetCalendarInfo} setIsPopUpOpen={setIsPopUpGetCalendarInfoOpen} />
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

            <div>{getHeader()}</div>

            <Link to={'/create_event'}>Create event</Link>
            <Link to={'/create_calendar'}>Create calendar</Link>

            <button onClick={setCurDayToday}>Today</button>

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
        let subtract;

        switch(curCalendars.representation) {
            case "month":
                subtract = 'months'
                break;
            case "year":
                subtract = 'years'
                break;
            default:
                subtract = 'weeks'
        }

        changeCurDate(moment(curCalendars.curDate).subtract(1, subtract));
    }
    
    function goForward() {
        let add;

        switch(curCalendars.representation) {
            case "month":
                add = 'months'
                break;
            case "year":
                add = 'years'
                break;
            default:
                add = 'weeks'
        }

        changeCurDate(moment(curCalendars.curDate).add(1, add));
    }

    function getRepresentationValue() {
        return representationOptions.find(option => option.value == curCalendars.representation);
    }

    function handleChangeRepresentation(event) {
        dispatch(setRepresentation({ representation: event.value }));
        window.location.reload();
    }

    function getHeader() {
        switch(curCalendars.representation) {
            case "month":
                return moment(new Date(curCalendars.curDate)).format('MMMM YYYY'); 
            case "year":
                return moment(new Date(curCalendars.curDate)).format('YYYY'); 
            default:
                return `Week ${moment(new Date(curCalendars.curDate)).format('W, YYYY')}`; 
        }
    }

    function setCurDayToday() {
        if (!moment(new Date()).isSame(moment(new Date(curCalendars.curDate)), "days")) {
            dispatch(removeCurDate());
            window.location.reload();
        }
    }
}

export default Sidebar;

