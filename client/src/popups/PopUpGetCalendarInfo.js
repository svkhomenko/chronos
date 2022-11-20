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
                        ? <PopUpDeleteFor setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
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
                            {
                                calendar.status != 'main' && calendar.userRole == 'admin' &&
                                <div onClick={() => {setIsPopUpInviteOpen(true)}}>
                                    <iconify-icon icon="mdi:invite"/>
                                </div>
                            }
                            <div>{calendar.name}</div>
                            <div>{calendar.description}</div>
                            <div>{calendar.arrangementColor}</div>
                            <div>{calendar.reminderColor}</div>
                            <div>{calendar.taskColor}</div>
                            <div>{calendar.status}</div>
                            <div>
                                {
                                    calendar.users.map(user => (
                                        <UserContainer key={user.id}
                                                        user={user}
                                                        calendar={calendar}
                                                        setCalendar={setCalendar} />
                                    ))
                                }
                            </div>
                        </div>
                    }
                </div>
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
        <div onClick={updateOpen}>
            {
                isPopUpSureOpen &&
                <PopUpSure text={`Do you want to remove ${user.login} from ${calendar.name} calendar?`} 
                            setIsSure={setIsSure} setIsPopUpOpen={setIsPopUpSureOpen} />
                
            }
            <div className="user_icon_outer">
                {
                    user.profilePicture
                    ? <img src={getSrc(user.profilePicture)} alt="avatar" />
                    : <div className='initials'>
                        {getAvatar(user.fullName)}
                    </div>
                }
            </div>
            {user.login}{' '}
            {
                isUpdating 
                ? <>
                    <div className='status_select_contatiner'>
                        <div className='label'>Role:</div>
                        <Select value={getRoleValue()} options={roleOptions} 
                                onChange={handleChangeRole} className='status_select' classNamePrefix='status_select' />
                    </div>
                    <button onClick={saveRole}>Save</button>
                </>
                : <div>{user.userRole}</div>
            }
            {
                calendar.userRole == 'admin' && user.id != curUser.id &&
                <button onClick={() => {setIsPopUpSureOpen(true)}}>
                    <iconify-icon icon="material-symbols:delete-rounded"/>
                </button>
            }
        </div>
    );

    function getRoleValue() {
        return roleOptions.find(option => option.value == role);
    }

    function handleChangeRole(event) {
        setRole(event.value);
    }

    function updateOpen() {
        if (calendar.userRole == 'admin') {
            setIsUpdating(true);
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

