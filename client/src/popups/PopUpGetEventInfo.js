import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, setMessage } from '../store/slices/calendarsSlice';
import PopUpSure from "./PopUpSure";
import UpdateEvent from "../calendars/UpdateEvent";
import { getDateString, deleteEvent } from "../calendars/calendars_tools";
import { SERVER_URL } from "../const";

function PopUpGetEventInfo({ curEvent, setCurEvent, setEvents, allEvents, setIsPopUpOpen }) {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpSureOpen, setIsPopUpSureOpen] = useState(false);
    const [isSure, setIsSure] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isSure) {
            deleteEvent(curEvent.id, curUser,
                () => {
                    dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                    dispatch(setMessage({ message: "Event was successfully deleted" }));
                    window.location.reload();
                }, 
                () => {
                    dispatch(removeUser());
                });
        }
    }, [isSure]);

    return (
        <>
            {
                isPopUpSureOpen &&
                <PopUpSure text={'Do you want to delete event?'} setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
            }
            <>
                <div className="popup_background" onClick={() => {setIsPopUpOpen(false)}} />
                <div className="popup_container">
                    {
                        isUpdating
                        ? <UpdateEvent curEvent={curEvent} setIsUpdating={setIsUpdating} />
                        : <>
                            <div className='icons_container'>
                                <div className='icon' onClick={() => {setIsPopUpSureOpen(true)}}>
                                    <iconify-icon icon="material-symbols:delete-rounded"/>
                                </div>
                                <div className='icon' onClick={() => {setIsUpdating(true)}}>
                                    <iconify-icon icon="material-symbols:edit"/>
                                </div>
                                {
                                    curEvent.category == "task" &&
                                    <div className='icon' onClick={setCompleted}>
                                        {
                                            curEvent.completed
                                            ? <iconify-icon icon="ic:outline-check-box" />
                                            : <iconify-icon icon="ic:outline-check-box-outline-blank" />
                                        }
                                    </div>
                                }  
                            </div> 
                            <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                                <iconify-icon icon="material-symbols:close" />
                            </div>
                            <div>{getDateString(curEvent)}</div>
                            <div className='name'>{curEvent.name}</div>
                            <div>{curEvent.category}</div>
                            <div className='description'>{curEvent.description}</div>
                            <div>{getCalendar().name}</div>                    
                        </>
                    }
                </div>
            </>
        </>
    );

    function getCalendar() {
        return curCalendars.calendars.find(calendar => calendar.id == curEvent.calendarId);
    }

    function setCompleted() {
        fetch(SERVER_URL + `/api/events/${curEvent.id}}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': curUser.token
            },
            body: JSON.stringify({
                completed: !curEvent.completed
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            
            setEvents(allEvents.map(event => {
                if (event.id != curEvent.id) {
                    return event;
                }
                return ({
                    ...event,
                    completed: !curEvent.completed
                });
            }));
            setCurEvent({
                ...curEvent,
                completed: !curEvent.completed
            });
        })
        .catch((err) => {
            console.log('err', err, err.body);
            switch(err.status) {
                case 401:
                case 403:
                    dispatch(removeUser());
                    window.location.href = '/login';
                    break;
                default:
                    window.location.href = '/error';
            }
        });
    }
}

export default PopUpGetEventInfo;

