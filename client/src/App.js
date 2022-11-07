import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setUser, removeUser } from './store/slices/userSlice';
import { SERVER_URL } from "./const";
import "./styles/main.css";

import Login from "./auth/Login";
import Register from "./auth/Register";
import EmailConfirmation from "./auth/EmailConfirmation";
import SendPasswordConfirmation from "./auth/SendPasswordConfirmation";
import PasswordConfirmation from "./auth/PasswordConfirmation";

import Header from "./tools/Header";

import Week from "./calendars/Week";

import NotFound from "./tools/NotFound";
import ErrorPage from "./tools/ErrorPage";

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
            })
            .then((data) => {
                dispatch(setUser({
                    id: data.id,
                    login: data.login,
                    email: data.email,
                    fullName: data.fullName,
                    profilePicture: data.profilePicture,
                    status: data.status,
                    token: curUser.token
                }));
            });
        }
    }, []);

    return (
        <Router>
            <Header />
            
            <Routes>
                <Route path="/login" element={curUser.id ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={curUser.id ? <Navigate to="/" /> : <Register />} />
                <Route path="/email-confirmation/:token" element={<EmailConfirmation />} />
                <Route path="/password-reset" element={<SendPasswordConfirmation />} />
                <Route path="/password-reset/:token" element={<PasswordConfirmation />} />

                <Route path="/" element={curUser.id ? <Navigate to="/week" /> : <Login />} />
                <Route path="/week" element={curUser.id ? <Week /> : <Login />} />
               
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;

