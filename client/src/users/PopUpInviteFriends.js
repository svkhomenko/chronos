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
            <div className="popup_container sure">
                <div className='display_center'>
                    <div>Invite friends to {calendar.name} calendar</div>
                    {chosenUsers.length !== 0 && 
                        <div className="categories_container">
                            {chosenUsers.map(user => (
                                <div key={user.id} 
                                    className="category tooltip" data-title={user.fullName}>
                                    <div className="user_icon_outer">
                                        {
                                            user.profilePicture
                                            ? <img src={getSrc(user.profilePicture)} alt="avatar" />
                                            : <div className='initials'>
                                                {getAvatar(user.fullName)}
                                            </div>
                                        }
                                    </div>
                                    {user.login}
                                    <div className='delete_category'
                                        onClick={() => {removeChosenUser(user)}}>
                                        <iconify-icon icon="iwwa:delete" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    <input className="search_input" 
                        value={usersSearch} onChange={handleChange} 
                        type="search" placeholder="Find friends" />
                    {usersSearch !== '' && allUsers.length !== 0 && 
                        <div className='options_container'>
                            {allUsers.map(user => (
                                <div key={user.id} className="options"
                                    onClick={() => {addUser(user)}}>
                                    <div className="user_icon_outer">
                                        {
                                            user.profilePicture
                                            ? <img src={getSrc(user.profilePicture)} alt="avatar" />
                                            : <div className='initials'>
                                                {getAvatar(user.fullName)}
                                            </div>
                                        }
                                    </div>
                                    {user.login}
                                </div>
                            ))}
                        </div>
                    }
                    {chosenUsers.length !== 0 && 
                        <button onClick={inviteUsers}>Invite friends</button>
                    }
                </div>
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

