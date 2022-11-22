import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { SERVER_URL } from "../const";

function EmailConfirmation() {
    let { token } = useParams();
    token = token.replaceAll('dot', '.');

    const [message, setMessage] = useState('Processing request...');

    useEffect(() => {
        fetch(SERVER_URL + `/api/auth/email-confirmation/${token}`, {
            method: 'POST'
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            else {
                setMessage('Email was successfully verified');
            }
        })
        .catch((err) => {
            console.log('err', err, err.body);
            switch(err.status) {
                case 401:
                    return err.json();
                default:
                    window.location.href = '/error';
            }
        })
        .then((err) => {
            if (err && err.message) {
                setMessage(err.message);
            }
        }); 
    }, []);

    return (
        <div className='display_center'>
            <div className='display_center_vertical'> 
                <div className='main_message'>{message}</div>
                <div className='auth_link'>
                    <Link to={'/login'}>
                        Go to the login page
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EmailConfirmation;

