import React, { useState } from 'react';;
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setMessage } from '../store/slices/calendarsSlice';
import { validateName, validateDescription } from "../tools/dataValidation";
import { getColorClassName } from "./calendars_tools";
import { colors } from "../tools/const_tools";
import { SERVER_URL } from "../const";

function UpdateCalendar({ calendar, setIsUpdating }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [name, setName] = useState(calendar.name);
    const [description, setDescription] = useState(calendar.description);
    const [arrangementColor, setArrangementColor] = useState(calendar.arrangementColor);
    const [reminderColor, setReminderColor] = useState(calendar.reminderColor);
    const [taskColor, setTaskColor] = useState(calendar.taskColor);

    const [nameMessage, setNameMessage] = useState('');
    const [descriptionMessage, setDescriptionMessage] = useState('');

    return (
        <>
            <div className='icon close'  onClick={() => {setIsUpdating(false)}}>
                <iconify-icon icon="material-symbols:close" />
            </div>
            <h2>Update calendar</h2>
            <form onSubmit={handleSubmit}>
                <div className='label'>Name:</div>
                <div className='message error'>{nameMessage}</div>
                <textarea value={name} onChange={handleChangeName} className="small" />

                <div className='label'>Description:</div>
                <div className='message error'>{descriptionMessage}</div>
                <textarea value={description} onChange={handleChangeDescription} className="large" />

                <div>
                    <div className='label'>Arrangement color:</div>
                    <div className='colors_container'>
                        {
                            colors.map((c, index) => (
                                <div key={index} className={getColorClassName(c, arrangementColor)} 
                                    onClick={() => {handleChangeColor(c, arrangementColor, setArrangementColor)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>
                </div>

                <div>
                    <div className='label'>Reminder color:</div>
                    <div className='colors_container'>
                        {
                            colors.map((c, index) => (
                                <div key={index} className={getColorClassName(c, reminderColor)} 
                                    onClick={() => {handleChangeColor(c, reminderColor, setReminderColor)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>
                </div>

                <div>
                    <div className='label'>Task color:</div>
                    <div className='colors_container'>
                        {
                            colors.map((c, index) => (
                                <div key={index} className={getColorClassName(c, taskColor)} 
                                    onClick={() => {handleChangeColor(c, taskColor, setTaskColor)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>
                </div>

                <input type="submit" value="Update calendar" className='button submit' />
            </form>
        </>
    );

    function handleChangeName(event) {
        setName(event.target.value);
    }

    function handleChangeDescription(event) {
        setDescription(event.target.value);
    }

    function handleChangeColor(color, chosenColor, setFunc) {
        if (color != chosenColor) {
            setFunc(color);
        }
        else {
            setFunc('');
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        setNameMessage('');
        setDescriptionMessage('');
        
        if (isDataValid()) {
            fetch(SERVER_URL + `/api/calendars/${calendar.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                },
                body: JSON.stringify({ 
                    name,
                    description,
                    arrangementColor,
                    reminderColor,
                    taskColor
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                dispatch(setMessage({ message: "Calendar was successfully updated" }));
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

        return valid;
    }
}

export default UpdateCalendar;

