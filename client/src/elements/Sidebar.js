import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Select from 'react-select';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/material/styles';
import customTheme from '../elements/customTheme';
import { useSelector, useDispatch } from 'react-redux';
import { setCalendars, setCurDate, removeCurDate, setRepresentation, setDropdownOpen, removeDropdownOpen, setIsHolidaysActive } from '../store/slices/calendarsSlice';
import PopUpGetCalendarInfo from "../popups/PopUpGetCalendarInfo";

function Dropdown({ setIsDropdownOpen }) {
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpGetCalendarInfoOpen, setIsPopUpGetCalendarInfoOpen] = useState(false);
    const [calendarForPopupGetCalendarInfo, setCalendarForPopupGetCalendarInfo] = useState();

    return (
        <div className='dropdown'>
            {
                isPopUpGetCalendarInfoOpen &&
                <PopUpGetCalendarInfo curCalendar={calendarForPopupGetCalendarInfo} setIsPopUpOpen={setIsPopUpGetCalendarInfoOpen} />
            }
            <div className='icon close' onClick={() => {setIsDropdownOpen(false)}}>
                <iconify-icon icon="material-symbols:close" />
            </div>
            <div className='dropdown_header'>Calendars</div>
            <div className='checkbox_outer calendar_outer'>
                <input type="checkbox" className="checkbox"
                        id='national_holidays' name='national_holidays'
                        checked={curCalendars.isHolidaysActive} onChange={toggleHolidaysActive} />
                <label htmlFor='national_holidays' className="checkbox_label">
                    National holidays
                </label>
            </div>
            {
                curCalendars.calendars.map(calendar => (
                    <div key={calendar.id} className='checkbox_outer calendar_outer'>
                        <input type="checkbox" className="checkbox"
                                id={`checkbox_calendar_${calendar.id}`} name={`checkbox_calendar_${calendar.id}`}
                                checked={calendar.active} onChange={() => {handleChangeActiveCalendar(calendar.id)}} />
                        <label htmlFor={`checkbox_calendar_${calendar.id}`} className="checkbox_label">
                            {calendar.name}
                        </label>
                        <div className='icon info' onClick={() => {setIsPopUpGetCalendarInfoOpen(true);setCalendarForPopupGetCalendarInfo(calendar);}}>
                            <iconify-icon icon="ep:info-filled" />
                        </div>
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
        dispatch(setDropdownOpen());
        window.location.reload();
    }

    function toggleHolidaysActive() {
        dispatch(setIsHolidaysActive({ isHolidaysActive: !curCalendars.isHolidaysActive }));
    }
}

function Sidebar() {
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isDropdownOpen, setIsDropdownOpen] = useState(curCalendars.isDropdownOpen);

    const representationOptions = [
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' }
    ];

    useEffect(() => {
        if (curCalendars.isDropdownOpen) {
            dispatch(removeDropdownOpen());
        }
    }, []);
    
    return (
        <div className='sidebar'>
            {
                isDropdownOpen &&
                <Dropdown setIsDropdownOpen={setIsDropdownOpen} />
            }
            <div className='sidebar_header'>{getHeader()}</div>
            <div className='links_container'>
                <Link to={'/create_event'} className='button negative'>
                    Create event
                </Link>
                <Link to={'/create_calendar'} className='button'>
                    Create calendar
                </Link>
            </div>
            <div className="settings_container">
                <div className='date_settings_container'>
                    <div className='dropdown_button icon' onClick={() => {setIsDropdownOpen(!isDropdownOpen)}}>
                        <iconify-icon icon="mdi:calendars" />
                    </div>
                    <button className='button' onClick={setCurDayToday}>Today</button>
                    <div className='arrows_container'>
                        <div className='icon' onClick={goBack}>
                            <iconify-icon icon="material-symbols:arrow-back-ios-rounded" />
                        </div>
                        <div className='icon' onClick={goForward}>
                            <iconify-icon icon="material-symbols:arrow-forward-ios-rounded" />
                        </div>
                    </div>
                    <div className='date_picker_outer'>
                        <ThemeProvider theme={customTheme}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DatePicker
                                    openTo="day"
                                    views={['year', 'month', 'day']}
                                    value={curCalendars.curDate}
                                    onChange={changeCurDate}
                                    renderInput={(params) => <TextField size='small' {...params} />}
                                />
                            </LocalizationProvider>
                        </ThemeProvider>
                    </div>
                </div>
                <Select value={getRepresentationValue()} options={representationOptions} 
                        onChange={handleChangeRepresentation} className='select small' classNamePrefix='select' />
            </div>
        </div>
    );

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

