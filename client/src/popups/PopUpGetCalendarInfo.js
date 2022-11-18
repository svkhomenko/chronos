import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, setMessage } from '../store/slices/calendarsSlice';
import PopUpSure from "./PopUpSure";
import UpdateCalendar from "../calendars/UpdateCalendar";
import { SERVER_URL } from "../const";

function PopUpGetCalendarInfo({ calendar, setIsPopUpOpen }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [isPopUpSureOpen, setIsPopUpSureOpen] = useState(false);
    const [isSure, setIsSure] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isSure) {
            fetch(SERVER_URL + `/api/calendars/${calendar.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                },
                body: JSON.stringify({
                    forAll: isSure == 'forAll'
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                    dispatch(setMessage({ message: "Calendar was successfully deleted" }));
                    window.location.reload();
                }
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
    }, [isSure]);

    return (
        <>
            {
                isPopUpSureOpen &&
                <>
                    {
                        calendar.userRole == 'admin'
                        ? <PopUpDeleteFor setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                        : <PopUpSure text={'Do you want to delete calendar?'} setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                    }
                </>
                
            }
            <div className="popup_background" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container">
                <div className='display_center'>
                    {
                        isUpdating
                        ? <UpdateCalendar calendar={calendar} setIsUpdating={setIsUpdating} />
                        : <div className='post_card no_hr user_form'>
                            {
                                calendar.status != 'main' &&
                                <div onClick={() => {setIsPopUpSureOpen(true)}}>
                                    <iconify-icon icon="material-symbols:delete-rounded"/>
                                </div>
                            }
                            {
                                calendar.userRole == 'admin' &&
                                <button onClick={() => {setIsUpdating(true)}}>
                                    <iconify-icon icon="material-symbols:edit"/>
                                </button>
                            }
                            <div>{calendar.name}</div>
                            <div>{calendar.description}</div>
                            <div>{calendar.arrangementColor}</div>
                            <div>{calendar.reminderColor}</div>
                            <div>{calendar.taskColor}</div>
                            <div>{calendar.status}</div>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}

function PopUpDeleteFor({ setIsSure, setIsPopUpOpen }) {
    return (
        <>
            <div className="popup_background sure" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container sure">
                <div className='display_center'>
                    <div onClick={() => {setIsSure('forAll'); setIsPopUpOpen(false);}}>
                        Delete for all
                    </div>
                    <div onClick={() => {setIsSure('forMe'); setIsPopUpOpen(false);}}>
                        Delete just for me
                    </div>
                    <div onClick={() => {setIsPopUpOpen(false)}}>Don't delete</div>
                </div>
            </div>
        </>
    );
}

export default PopUpGetCalendarInfo;

