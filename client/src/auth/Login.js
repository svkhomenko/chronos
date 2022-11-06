import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import { SERVER_URL, CLIENT_URL } from "../const";

function Login() {
    const dispatch = useDispatch();

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const [errMessage, setErrMessage] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    return (
        <div className='display_center'>
            <div className='post_card no_hr user_form'> 
                <h2>Login</h2>
                <div className='message error'>{errMessage}</div>
                <form onSubmit={handleSubmit}>
                    <div className='label'>Login:</div>
                    <div className='message error'>{loginMessage}</div>
                    <input type="text" value={login} onChange={handleChangeLogin} className="input" />

                    <div className='label'>Password:</div>
                    <div className='message error'>{passwordMessage}</div>
                    <input type="password" value={password} onChange={handleChangePassword} className="input" />

                    <input type="submit" value="Log in" className='button submit' />
                </form>
                <div className='auth_link'>
                    Don't have an account yet?{' '} 
                    <Link to={'/register'}>
                        Create one
                    </Link>
                </div>
                <div className='auth_link'>
                    Forgot your password?{' '}
                    <Link to={'/password-reset'}>
                        Reset it
                    </Link>
                </div>
            </div>
        </div>
    );


    function handleChangeLogin(event) {
        setLogin(event.target.value);
    }

    function handleChangePassword(event) {
        setPassword(event.target.value);
    } 

    function handleSubmit(event) {
        event.preventDefault();

        setLoginMessage('');
        setPasswordMessage('');

        if (isDataValid()) {
            fetch(SERVER_URL + '/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    login,
                    password,
                    link: CLIENT_URL + '/email-confirmation' })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then((data) => {
                dispatch(setUser({
                    id: data.id,
                    login: data.login,
                    email: data.email,
                    fullName: data.fullName,
                    profilePicture: data.profilePicture,
                    status: data.status,
                    token: data.token
                }));
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 400:
                    case 403:
                        return err.json();
                    default:
                        window.location.href = '/error';
                }
            })
            .then((err) => {
                if (err && err.message) {
                    setErrMessage(err.message);
                }
            }); 
        }
    }

    function isDataValid() {
        let validData = true;

        if (!login) {
            setLoginMessage("Login is required");
            validData = false;
        }
        if (!password) {
            setPasswordMessage("Password is required");
            validData = false;
        }

        return validData;
    }
}

export default Login;

