import React from 'react';
import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { getSrc, getAvatar } from "./tools_func";
import { SERVER_URL } from "../const";

function Header() {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();
    
    return (
        <header> 
            <h1><Link to={'/'}>Chronos</Link></h1>
            {/* <div className='menu_bar'>
                <NavLink to={'/'}
                        className={() => (window.location.pathname == "/" || window.location.pathname.startsWith('/posts')) ? "active" : ""}>
                    Posts
                </NavLink>
                <NavLink to={'/categories'}
                        className={({ isActive }) => isActive ? "active" : ""}>
                    Categories
                </NavLink>
                <NavLink to={'/users'} 
                        className={({ isActive }) => isActive ? "active" : ""}>
                    Users
                </NavLink>
            </div> */}
            {
                curUser.id 
                ? <div className='header_buttons_container'>
                    <button className="button first" onClick={logout}>Log out</button>
                    <Link to={'/profile'} className="user_icon_container">
                        <div className="user_icon_outer">
                            {
                                curUser.profilePicture
                                ? <img src={getSrc(curUser.profilePicture)} alt="avatar" />
                                : <div className='initials'>
                                    {getAvatar(curUser.fullName)}
                                </div>
                            }
                        </div>
                        <span>{curUser.login}</span>
                    </Link>
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

