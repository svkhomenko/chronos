import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, setMessage } from '../store/slices/calendarsSlice';
import { validateName, validateDescription, validateDate } from "../tools/dataValidation";
import { isAllDay } from "../calendars/calendars_tools";
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
        <div className='post_card no_hr user_form'> 
            <div onClick={() => {setIsUpdating(false)}}>
                <iconify-icon icon="material-symbols:close" />
            </div>
            <h2>Update Event</h2>
            <form onSubmit={handleSubmit}>
                <div className='label'>Name:</div>
                <div className='message error'>{nameMessage}</div>
                <input type="text" value={name} onChange={handleChangeName} className="input" />

                <div className='label'>Description:</div>
                <div className='message error'>{descriptionMessage}</div>
                <textarea value={description} onChange={handleChangeDescription} className="large" />

                <div className='label'>
                    {curEvent.category == 'arrangement' ? "Date from:" : "Date"}
                </div>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                        label="Responsive"
                        renderInput={(params) => <TextField {...params} />}
                        value={dateFrom}
                        onChange={(newValue) => {
                            setDateFrom(newValue);
                        }}
                    />
                </LocalizationProvider>

                {
                    curEvent.category == 'arrangement'
                    ? <div>
                        <div className='label'>Date to:</div>
                        <div className='message error'>{dateToMessage}</div>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DateTimePicker
                                label="Responsive"
                                renderInput={(params) => <TextField {...params} />}
                                value={dateTo}
                                onChange={(newValue) => {
                                    setDateTo(newValue);
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                    : <div>
                        <input type="checkbox" className="status_checkbox"
                                id='all_day' name='all_day'
                                checked={allDay} onChange={handleChangeAllDay} />
                        <label htmlFor='all_day' className="status_label">
                            All day
                        </label>
                    </div>
                }

                <div>
                    Color: 
                    { color &&
                        <div>
                            Chosen color: <div className='color' style={{ backgroundColor: color }} />
                            <div onClick={() => {setColor('')}}>Delete color</div>
                        </div>
                    }
                    {
                        colors.map((c, index) => (
                            <div key={index} className='color' onClick={() => {setColor(c)}}
                                style={{ backgroundColor: c }} />
                        ))
                    }
                </div>

                <input type="submit" value="Update event" className='button submit' />
            </form>
        </div>
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

