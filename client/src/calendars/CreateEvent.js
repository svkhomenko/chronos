import React, { useState } from 'react';
import Select from 'react-select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setMessage } from '../store/slices/calendarsSlice';
import { validateName, validateDescription, validateDate } from "../tools/dataValidation";
import { colors } from "../tools/const_tools";
import { SERVER_URL } from "../const";  

function CreateEvent() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('arrangement');
    const [calendar, setCalendar] = useState(getMainCalendarId());
    const [dateFrom, setDateFrom] = useState(moment(new Date()));
    const [dateTo, setDateTo] = useState(moment(new Date()).add(0.5, 'hours'));
    const [allDay, setAllDay] = useState(false);
    const [color, setColor] = useState('');

    const [nameMessage, setNameMessage] = useState('');
    const [descriptionMessage, setDescriptionMessage] = useState('');
    const [dateToMessage, setDateToMessage] = useState('');

    const categoryOptions = [
        { value: 'arrangement', label: 'Arrangement' },
        { value: 'reminder', label: 'Reminder' },
        { value: 'task', label: 'Task' }
    ];
    
    const calendarOptions = curCalendars.calendars.map(calendar => (
        { value: calendar.id, label: calendar.name }
    ));

    return (
        <div className='display_center'>
            <div className='post_card no_hr user_form'> 
                <h2>Create new event</h2>
                <form onSubmit={handleSubmit}>
                    <div className='label'>Name:</div>
                    <div className='message error'>{nameMessage}</div>
                    <input type="text" value={name} onChange={handleChangeName} className="input" />

                    <div className='label'>Description:</div>
                    <div className='message error'>{descriptionMessage}</div>
                    <textarea value={description} onChange={handleChangeDescription} className="large" />

                    <div className='status_select_contatiner'>
                        <div className='label'>Category:</div>
                        <Select value={getCategoryValue()} options={categoryOptions} 
                                onChange={handleChangeCategory} className='status_select' classNamePrefix='status_select' />
                    </div>

                    <div className='status_select_contatiner'>
                        <div className='label'>Calendar:</div>
                        <Select value={getCalendarValue()} options={calendarOptions} 
                                onChange={handleChangeCalendar} className='status_select' classNamePrefix='status_select' />
                    </div>

                    <div className='label'>
                        {category == 'arrangement' ? "Date from:" : "Date"}
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
                        category == 'arrangement'
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

                    <input type="submit" value="Create event" className='button submit' />
                </form>
            </div>
        </div>
    );

    function getMainCalendarId() {
        let main = curCalendars.calendars.find(calendar => calendar.status == "main");
        return main.id;
    }

    function getCategoryValue() {
        return categoryOptions.find(option => option.value == category);
    }

    function getCalendarValue() {
        return calendarOptions.find(option => option.value == calendar);
    }

    function handleChangeName(event) {
        setName(event.target.value);
    }

    function handleChangeDescription(event) {
        setDescription(event.target.value);
    }

    function handleChangeCategory(event) {
        setCategory(event.value);
    }

    function handleChangeCalendar(event) {
        setCalendar(event.value);
    }

    function handleChangeAllDay() {
        setAllDay(!allDay);

        if (category !== "arrangement" && !allDay) {
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
            fetch(SERVER_URL + `/api/calendars/${calendar}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                },
                body: JSON.stringify({ 
                    name,
                    description,
                    category,
                    dateFrom,
                    dateTo,
                    color
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                dispatch(setMessage({ message: "Event was successfully created" }));
                window.location.href = '/';
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
        if (category == "arrangement") {
            valid = validateDate(dateFrom, dateTo, setDateToMessage) && valid;
        }

        return valid;
    }
}

export default CreateEvent;

