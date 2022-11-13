import React, { useState } from 'react';;
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setMessage } from '../store/slices/calendarsSlice';
import { validateName, validateDescription } from "../tools/dataValidation";
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
        <div className='display_center'>
            <div className='post_card no_hr user_form'> 
                <div onClick={() => {setIsUpdating(false)}}>
                    <iconify-icon icon="material-symbols:close" />
                </div>
                <h2>Update calendar</h2>
                <form onSubmit={handleSubmit}>
                    <div className='label'>Name:</div>
                    <div className='message error'>{nameMessage}</div>
                    <input type="text" value={name} onChange={handleChangeName} className="input" />

                    <div className='label'>Description:</div>
                    <div className='message error'>{descriptionMessage}</div>
                    <textarea value={description} onChange={handleChangeDescription} className="large" />

                    <div>
                        Arrangement color: 
                        { arrangementColor &&
                            <div>
                                Chosen color: <div className='color' style={{ backgroundColor: arrangementColor }} />
                                <div onClick={() => {setArrangementColor('')}}>Delete color</div>
                            </div>
                        }
                        {
                            colors.map((c, index) => (
                                <div key={index} className='color' onClick={() => {setArrangementColor(c)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>

                    <div>
                        Reminder color: 
                        { reminderColor &&
                            <div>
                                Chosen color: <div className='color' style={{ backgroundColor: reminderColor }} />
                                <div onClick={() => {setReminderColor('')}}>Delete color</div>
                            </div>
                        }
                        {
                            colors.map((c, index) => (
                                <div key={index} className='color' onClick={() => {setReminderColor(c)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>

                    <div>
                        Task color:
                        { taskColor &&
                            <div>
                                Chosen color: <div className='color' style={{ backgroundColor: taskColor }} />
                                <div onClick={() => {setTaskColor('')}}>Delete color</div>
                            </div>
                        }
                        {
                            colors.map((c, index) => (
                                <div key={index} className='color' onClick={() => {setTaskColor(c)}}
                                    style={{ backgroundColor: c }} />
                            ))
                        }
                    </div>

                    <input type="submit" value="Update calendar" className='button submit' />
                </form>
            </div>
        </div>
    );

    function handleChangeName(event) {
        setName(event.target.value);
    }

    function handleChangeDescription(event) {
        setDescription(event.target.value);
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

