import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setUser, removeUser } from './store/slices/userSlice';
import { removeCalendars, removeCurDate, removeRepresentation } from './store/slices/calendarsSlice';
import { SERVER_URL } from "./const";
import "./styles/main.css";

import Login from "./auth/Login";
import Register from "./auth/Register";
import EmailConfirmation from "./auth/EmailConfirmation";
import SendPasswordConfirmation from "./auth/SendPasswordConfirmation";
import PasswordConfirmation from "./auth/PasswordConfirmation";

import ProfilePage from "./users/ProfilePage";

import Header from "./elements/Header";
import Message from "./popups/Message";

import Calendar from "./calendars/Calendar";

import CreateCalendar from "./calendars/CreateCalendar";
import CreateEvent from "./calendars/CreateEvent";

import NotFound from "./elements/NotFound";
import ErrorPage from "./elements/ErrorPage";

function App() {
    const curUser = useSelector((state) => state.user);
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (curUser.id) {
            fetch(SERVER_URL + `/api/users/${curUser.id}`, 
            {
                method: 'GET',
                headers: {
                    'authorization': curUser.token
                }
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                dispatch(removeUser());
                dispatch(removeCalendars());
                dispatch(removeCurDate());
                dispatch(removeRepresentation());
            })
            .then((data) => {
                if (data) {
                    dispatch(setUser({
                        id: data.id,
                        login: data.login,
                        email: data.email,
                        fullName: data.fullName,
                        profilePicture: data.profilePicture,
                        status: data.status,
                        token: curUser.token
                    }));
                }
            });
        }
        else  {
            dispatch(removeUser());
            dispatch(removeCalendars());
            dispatch(removeCurDate());
            dispatch(removeRepresentation());
        }
    }, []);

    return (
        <Router>
            <Header />

            <Message />
            
            <Routes>
                <Route path="/login" element={curUser.id ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={curUser.id ? <Navigate to="/" /> : <Register />} />
                <Route path="/email-confirmation/:token" element={<EmailConfirmation />} />
                <Route path="/password-reset" element={<SendPasswordConfirmation />} />
                <Route path="/password-reset/:token" element={<PasswordConfirmation />} />

                <Route path="/profile" element={curUser.id ? <ProfilePage /> : <Navigate to="/login" />} />

                <Route path="/" element={curUser.id ? <Calendar /> : <Navigate to="/login" />} />
                {/* <Route path="/" element={<Calendar />} /> */}

                <Route path="/create_calendar" element={curUser.id ? <CreateCalendar /> : <Navigate to="/login" />} />
                <Route path="/create_event" element={curUser.id ? <CreateEvent /> : <Navigate to="/login" />} />
               
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;

