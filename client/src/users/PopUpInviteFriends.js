import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setCalendars, setMessage } from '../store/slices/calendarsSlice';
import { getSrc, getAvatar } from "../tools/tools_func";
import { SERVER_URL } from "../const";

function PopUpInviteFriends({ calendar, setCalendar, setIsPopUpOpen }) {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [chosenUsers, setChosenUsers] = useState([]);
    const [usersSearch, setUsersSearch] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (usersSearch) {
            fetch(SERVER_URL + '/api/users?' + new URLSearchParams(
                {
                    search: usersSearch,
                    notUsersIds: calendar.users.map(user => user.id).join(',')
                }
            ), 
            {
                method: 'GET',
                headers: {
                    'authorization': curUser.token
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then((response) => {
                setAllUsers(response);
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 401:
                        dispatch(removeUser());
                        window.location.href = '/login';
                        break;
                    default:
                        window.location.href = '/error';
                }
            });
        }
    }, [usersSearch]);

    return (
        <>
            <div className="popup_background sure" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container sure large">
                <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                    <iconify-icon icon="material-symbols:close" />
                </div>
                <h2>Invite friends to {calendar.name} calendar</h2>
                {chosenUsers.length !== 0 && 
                    <div className="calendar_users_container">
                        {chosenUsers.map(user => (
                            <div key={user.id} className="user_container">
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
                                    <div className='status'>{user.fullName}</div>
                                </div>
                                <div className='icon delete' onClick={() => {removeChosenUser(user)}}>
                                    <iconify-icon icon="iwwa:delete" />
                                </div>
                            </div>
                        ))}
                    </div>
                }
                <input className="input" value={usersSearch} onChange={handleChange} 
                    type="search" placeholder="Find friends" />
                {usersSearch !== '' && allUsers.length !== 0 && 
                    <div className='calendar_users_container'>
                        {allUsers.map(user => (
                            <div key={user.id} className="user_container" onClick={() => {addUser(user)}}>
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
                                    <div className='status'>{user.fullName}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
                {chosenUsers.length !== 0 && 
                    <button className='button' onClick={inviteUsers}>
                        Invite friends
                    </button>
                }
            </div>
        </>
    );

    function handleChange(event) {
        setUsersSearch(event.target.value);
    }

    function addUser(user) {
        if (!chosenUsers.find(u => u.id == user.id)) {
            setChosenUsers([...chosenUsers, user]);
        }
    }
    
    function removeChosenUser(user) {
        setChosenUsers(chosenUsers.filter(u => u.id != user.id));
    }

    function inviteUsers() {
        fetch(SERVER_URL + `/api/calendars/${calendar.id}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': curUser.token
            },
            body: JSON.stringify({ 
                userIds: chosenUsers.map(user => user.id)
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }

            const users = [...calendar.users, ...chosenUsers.map(chosenUser => ({
                ...chosenUser,
                userRole: "user"
            }))];

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
            dispatch(setMessage({ message: `Users were invited to ${calendar.name} calendar` }));
            setIsPopUpOpen(false);
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

export default PopUpInviteFriends;

