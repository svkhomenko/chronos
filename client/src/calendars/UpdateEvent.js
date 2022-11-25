import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/material/styles';
import customTheme from '../elements/customTheme';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, setMessage } from '../store/slices/calendarsSlice';
import { validateName, validateDescription, validateDate } from "../tools/dataValidation";
import { isAllDay, getColorClassName } from "../calendars/calendars_tools";
import { colors } from "../tools/const_tools";
import { SERVER_URL } from "../const";

function UpdateEvent({ curEvent, setIsUpdating }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [name, setName] = useState(curEvent.name);
    const [description, setDescription] = useState(curEvent.description);
    const [dateFrom, setDateFrom] = useState(moment(new Date(curEvent.dateFrom)));
    const [dateTo, setDateTo] = useState(moment(new Date(curEvent.dateTo)));
    const [allDay, setAllDay] = useState(isAllDay(curEvent));
    const [color, setColor] = useState(curEvent.color);

    const [nameMessage, setNameMessage] = useState('');
    const [descriptionMessage, setDescriptionMessage] = useState('');
    const [dateToMessage, setDateToMessage] = useState('');

    return (
        <> 
            <div className='icon close' onClick={() => {setIsUpdating(false)}}>
                <iconify-icon icon="material-symbols:close" />
            </div>
            <h2>Update Event</h2>
            <form onSubmit={handleSubmit}>
                <div className='label'>Name:</div>
                <div className='message error'>{nameMessage}</div>
                <textarea value={name} onChange={handleChangeName} className="small" />

                <div className='label'>Description:</div>
                <div className='message error'>{descriptionMessage}</div>
                <textarea value={description} onChange={handleChangeDescription} className="large" />

                <div className='label'>
                    {curEvent.category == 'arrangement' ? "Date from:" : "Date:"}
                </div>
                <ThemeProvider theme={customTheme}>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DateTimePicker
                            renderInput={(params) => <TextField size='small' {...params} />}
                            value={dateFrom}
                            onChange={(newValue) => {
                                setDateFrom(newValue);
                            }}
                        />
                    </LocalizationProvider>
                </ThemeProvider>

                {
                    curEvent.category == 'arrangement'
                    ? <div>
                        <div className='label'>Date to:</div>
                        <div className='message error'>{dateToMessage}</div>
                        <ThemeProvider theme={customTheme}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DateTimePicker
                                    renderInput={(params) => <TextField size='small' {...params} />}
                                    value={dateTo}
                                    onChange={(newValue) => {
                                        setDateTo(newValue);
                                    }}
                                />
                            </LocalizationProvider>
                        </ThemeProvider>
                    </div>
                    : <div className='checkbox_outer'>
                        <input type="checkbox" className="checkbox"
                                id='all_day' name='all_day'
                                checked={allDay} onChange={handleChangeAllDay} />
                        <label htmlFor='all_day' className="checkbox_label">
                            All day
                        </label>
                    </div>
                }

                <div>
                    <div className='label'>Color:</div>
                    <div className='colors_container'>
                        {
                            colors.map((c, index) => (
                                <div key={index} className={getColorClassName(c, color)} 
                                    onClick={() => {handleChangeColor(c)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>
                </div>

                <input type="submit" value="Update event" className='button submit' />
            </form>
        </>
    );

    function handleChangeName(event) {
        setName(event.target.value);
    }

    function handleChangeDescription(event) {
        setDescription(event.target.value);
    }

    function handleChangeAllDay() {
        setAllDay(!allDay);

        if (curEvent.category !== "arrangement" && !allDay) {
            setDateFrom(moment(dateFrom).startOf('day').toDate());
            setDateTo(moment(dateFrom).endOf('day').toDate());
        }
    }

    function handleChangeColor(c) {
        if (c != color) {
            setColor(c);
        }
        else {
            setColor('');
        }
    }
    
    function handleSubmit(event) {
        event.preventDefault();

        setNameMessage('');
        setDescriptionMessage('');
        setDateToMessage('');
        
        if (isDataValid()) {
            fetch(SERVER_URL + `/api/events/${curEvent.id}}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                },
                body: JSON.stringify({ 
                    name,
                    description,
                    dateFrom,
                    dateTo,
                    color
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                dispatch(setMessage({ message: "Event was successfully updated" }));
                window.location.reload();
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 400:
                        return err.json();
                    case 401:
                    case 403:
                        dispatch(removeUser());
                        window.location.href = '/login';
                        break;
                    default:
                        window.location.href = '/error';
                }
            })
            .then((err) => {
                if (err && err.message) {
                    if (err.message.includes('Name')) {
                        setNameMessage(err.message);
                    }
                    else if (err.message.includes('Description')) {
                        setDescriptionMessage(err.message);
                    }
                    else if (err.message.includes('DateTo')) {
                        setDateToMessage(err.message);
                    }
                    else {
                        window.location.href = '/error';
                    }
                }
            }); 
        }
    }

    function isDataValid() {
        let valid = true;

        valid = validateName(name, setNameMessage) && valid;
        valid = validateDescription(description, setDescriptionMessage) && valid;
        if (curEvent.category == "arrangement") {
            valid = validateDate(dateFrom, dateTo, setDateToMessage) && valid;
        }

        return valid;
    }
}

export default UpdateEvent;

