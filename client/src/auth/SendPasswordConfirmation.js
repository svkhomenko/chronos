import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { SERVER_URL, CLIENT_URL } from "../const";
import { validateEmail } from "../tools/dataValidation";

function SendPasswordConfirmation() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errMessage, setErrMessage] = useState('');

    return (
        <div className='display_center'>
            <div> 
                {
                    message 
                    ? <div className='main_message'>{message}</div>
                    : <> 
                        <h2>Send password confirmation</h2>
                        <div className='message error'>{errMessage}</div>
                        <div className='label'>
                            Please enter the email you use for registration
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className='label'>Email:</div>
                            <input type="text" value={email} onChange={handleChangeEmail} className="input" />
                            
                            <input type="submit" value="Request password reset" className='button submit' />
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
    
    function handleChangeEmail(event) {
        setEmail(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (isDataValid()) {
            fetch(SERVER_URL + '/api/auth/password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    link: CLIENT_URL + '/password-reset'
                })
            })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                else {
                    setMessage(`Password reset confirmation sent to email ${email}`);
                }
            })
            .catch((err) => {
                console.log('err', err, err.body);
                switch(err.status) {
                    case 400:
                    case 404:
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
        return validateEmail(email, setErrMessage);
    }
}

export default SendPasswordConfirmation;

