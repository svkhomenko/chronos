import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { getSrc, getAvatar } from "../tools/tools_func";
import { SERVER_URL } from "../const";
import PopUpProfile from '../users/PopUpProfile';
import SearchBar from './SearchBar';

function Header() {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [isPopUpProfileOpen, setIsPopUpProfileOpen] = useState(false);
    
    return (
        <>
            {
                isPopUpProfileOpen &&
                <PopUpProfile setIsPopUpOpen={setIsPopUpProfileOpen} />
            }
            <header> 
                <h1><Link to={'/'}>Chronos</Link></h1>
                {
                    curUser.id &&
                    <SearchBar />
                }
                {
                    curUser.id 
                    ? <div className='header_buttons_container'>
                        <button className="button first" onClick={logout}>Log out</button>
                        <div onClick={() => {setIsPopUpProfileOpen(true)}} className="user_icon_container">
                            <div className="user_icon_outer">
                                {
                                    curUser.profilePicture
                                    ? <img src={getSrc(curUser.profilePicture)} alt="avatar" />
                                    : <>
                                        {getAvatar(curUser.fullName)}
                                    </>
                                }
                            </div>
                            <span>{curUser.login}</span>
                        </div>
                    </div>
                    : <div className='header_buttons_container'>
                        <Link to={'/register'} className="button negative first">
                            Create account
                        </Link>
                        <Link to={'/login'} className="button">
                            Log in
                        </Link>
                    </div>
                }
            </header>
        </>
    );

    function logout() {
        fetch(SERVER_URL + '/api/auth/logout', {
            method: 'POST',
            headers: {
                'authorization': curUser.token
            }
        })
        .then(() => {
            dispatch(removeUser());
        })
        .catch((err) => {
            console.log('err', err, err.body);
            window.location.href = '/error';
        }); 
    }
}

export default Header;

