import React, { useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { checkPasswordConfirmation, validatePassword } from "../tools/dataValidation";
import { SERVER_URL } from "../const";

function PasswordConfirmation() {
    let { token } = useParams();
    token = token.replaceAll('dot', '.');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [errMessage, setErrMessage] = useState('');

    return (
        <div className='display_center'>
            <div> 
                {
                    message 
                    ? <div className='main_message'>{message}</div>
                    : <>
                        <h2>Update password</h2>
                        <div className='message error'>{errMessage}</div>
                        <form onSubmit={handleSubmit}>
                            <div className='label'>Password:</div>
                            <input type="password" value={password} onChange={handleChangePassword} className="input" />
                            
                            <div className='label'>Password confirmation:</div>
                            <input type="password" value={passwordConfirmation} onChange={handleChangePasswordConfirmation} className="input" />

                            <input type="submit" value="Reset password" className='button submit' />
                        </form>
                    </>
                }
                <div className='auth_link'>
                    <Link to={'/login'}>
                        Go to the login page
                    </Link>
                </div>
            </div>
        </div>
    );

    function handleChangePassword(event) {
        setPassword(event.target.value);
    } 

    function handleChangePasswordConfirmation(event) {
        setPasswordConfirmation(event.target.value);
    } 

    function handleSubmit(event) {
        event.preventDefault();

        if (isDataValid()) {
            setErrMessage('Processing request...');

            fetch(SERVER_URL + `/api/auth/password-reset/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    newPassword: password
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    setMessage('Password was successfully updated');
                }
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 400:
                    case 401:
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

        validData = checkPasswordConfirmation(password, passwordConfirmation, setErrMessage) && validData;
        validData = validatePassword(password, setErrMessage) && validData;

        return validData;
    }
}

export default PasswordConfirmation;

