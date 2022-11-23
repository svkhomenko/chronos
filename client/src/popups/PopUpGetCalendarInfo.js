import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setCalendars, setScrollToY, setMessage } from '../store/slices/calendarsSlice';
import PopUpSure from "./PopUpSure";
import UpdateCalendar from "../calendars/UpdateCalendar";
import PopUpInviteFriends from "../users/PopUpInviteFriends";
import { getSrc, getAvatar } from "../tools/tools_func";
import { SERVER_URL } from "../const";

function PopUpGetCalendarInfo({ curCalendar, setIsPopUpOpen }) {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [calendar, setCalendar] = useState(curCalendar);

    const [isPopUpSureOpen, setIsPopUpSureOpen] = useState(false);
    const [isSure, setIsSure] = useState(false);

    const [isPopUpInviteOpen, setIsPopUpInviteOpen] = useState(false);

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

                dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                dispatch(setMessage({ message: "Calendar was successfully deleted" }));
                window.location.reload();
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
                        ? <PopUpDeleteFor calendarName={calendar.name} setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                        : <PopUpSure text={'Do you want to delete calendar?'} setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                    }
                </>
                
            }
            {
                isPopUpInviteOpen &&
                <PopUpInviteFriends calendar={calendar} setCalendar={setCalendar} setIsPopUpOpen={setIsPopUpInviteOpen} />
            }
            <div className="popup_background" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container">
                {
                    isUpdating
                    ? <UpdateCalendar calendar={calendar} setIsUpdating={setIsUpdating} />
                    : <>
                        <div className='icons_container'>
                            {
                                calendar.status != 'main' &&
                                <div className='icon' onClick={() => {setIsPopUpSureOpen(true)}}>
                                    <iconify-icon icon="material-symbols:delete-rounded"/>
                                </div>
                            }
                            {
                                calendar.userRole == 'admin' &&
                                <div className='icon' onClick={() => {setIsUpdating(true)}}>
                                    <iconify-icon icon="material-symbols:edit"/>
                                </div>
                            }
                            {
                                calendar.status != 'main' && calendar.userRole == 'admin' &&
                                <div className='icon' onClick={() => {setIsPopUpInviteOpen(true)}}>
                                    <iconify-icon icon="mdi:invite"/>
                                </div>
                            }
                        </div>
                        <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                            <iconify-icon icon="material-symbols:close" />
                        </div>
                        <div className='name'>{calendar.name}</div>
                        <div className='status'>{calendar.status}</div>
                        <div className='description'>{calendar.description}</div>
                        <div className='calendar_colors_container'>
                            <div style={{ color: calendar.arrangementColor }}>Arrangement</div>
                            <div style={{ color: calendar.reminderColor }}>Reminder</div>
                            <div style={{ color: calendar.taskColor }}>Task</div>
                        </div>
                        <div className='calendar_users_container'>
                            {
                                calendar.users.map(user => (
                                    <UserContainer key={user.id}
                                                    user={user}
                                                    calendar={calendar}
                                                    setCalendar={setCalendar} />
                                ))
                            }
                        </div>
                    </>
                }
            </div>
        </>
    );
}

function UserContainer({ user, calendar, setCalendar }) {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpSureOpen, setIsPopUpSureOpen] = useState(false);
    const [isSure, setIsSure] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);

    const [role, setRole] = useState(user.userRole);

    const roleOptions = [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
    ];

    useEffect(() => {
        if (isSure) {
            fetch(SERVER_URL + `/api/calendars/${calendar.id}/users`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': curUser.token
                },
                body: JSON.stringify({
                    userIds: [user.id]
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }

                const users = calendar.users.filter(u => u.id != user.id);
                dispatch(setCalendars({
                    calendars: curCalendars.calendars.map(c => {
                        if (c.id != calendar.id) {
                            return c;
                        }
                        return ({
                            ...calendar,
                            users: users
                        });
                    })
                }));
                setCalendar({
                    ...calendar,
                    users: users
                });
                dispatch(setMessage({ message: `${user.login} was removed from ${calendar.name} calendar` }));
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
        <div className='user_container' onClick={updateOpen}>
            {
                isPopUpSureOpen &&
                <PopUpSure text={`Do you want to remove ${user.login} from ${calendar.name} calendar?`} 
                            setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                
            }
            <div className="user_icon_outer small">
                {
                    user.profilePicture
                    ? <img src={getSrc(user.profilePicture)} alt="avatar" />
                    : <>
                        {getAvatar(user.fullName, ' small')}
                    </>
                }
            </div>
            <div className='user_info'>
                <div className='login'>{user.login}</div>
                {
                    !isUpdating && 
                    <div className='status'>{user.userRole}</div>
                }
            </div>
            {
                isUpdating && 
                <>
                    <Select value={getRoleValue()} options={roleOptions} 
                            onChange={handleChangeRole} className='select' classNamePrefix='select' />
                    <button className='button' onClick={saveRole}>Save</button>
                </>
            }
            {
                calendar.userRole == 'admin' && user.id != curUser.id &&
                <div className='icon delete' onClick={(e) => {setIsPopUpSureOpen(true)}}>
                    <iconify-icon icon="material-symbols:delete-rounded"/>
                </div>
            }
        </div>
    );

    function getRoleValue() {
        return roleOptions.find(option => option.value == role);
    }

    function handleChangeRole(event) {
        setRole(event.value);
    }

    function updateOpen(e) {
        if (calendar.userRole == 'admin' && e.target.className == 'user_container') {
            setIsUpdating(!isUpdating);
        }
    }

    function saveRole() {
        if (role == user.userRole) {
            setIsUpdating(false);
            return;
        }
        
        fetch(SERVER_URL + `/api/calendars/${calendar.id}/users/${user.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': curUser.token
            },
            body: JSON.stringify({
                role: role
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            
            const users = calendar.users.map(u => {
                if (u.id != user.id) {
                    return u;
                }
                return ({
                    ...user,
                    userRole: role
                });
            });
            dispatch(setCalendars({
                calendars: curCalendars.calendars.map(c => {
                    if (c.id != calendar.id) {
                        return c;
                    }
                    return ({
                        ...calendar,
                        users: users,
                        userRole: (user.id == curUser.id ? role : calendar.userRole)
                    });
                })
            }));
            setCalendar({
                ...calendar,
                users: users,
                userRole: (user.id == curUser.id ? role : calendar.userRole)
            });
            dispatch(setMessage({ message: `${user.login}'s role was successfully updated` }));
            setIsUpdating(false);
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

function PopUpDeleteFor({ calendarName, setIsSure, setIsPopUpOpen }) {
    return (
        <>
            <div className="popup_background sure" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container sure large">
                <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                    <iconify-icon icon="material-symbols:close" />
                </div>
                <div className='sure_text'>Do you want to delete {calendarName} calendar?</div>
                <div className='sure_buttons_container'>
                    <div className='button negative' onClick={() => {setIsSure('forAll'); setIsPopUpOpen(false);}}>
                        Delete for all
                    </div>
                    <div className='button' onClick={() => {setIsSure('forMe'); setIsPopUpOpen(false);}}>
                        Delete just for me
                    </div>
                    <div className='button negative' onClick={() => {setIsPopUpOpen(false)}}>
                        Don't delete
                    </div>
                </div>
            </div>
        </>
    );
}

export default PopUpGetCalendarInfo;

