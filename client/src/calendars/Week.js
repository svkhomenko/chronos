import React, { useState, useEffect } from 'react';
// import { Link, NavLink } from "react-router-dom";
// import { useSelector, useDispatch } from 'react-redux';
// import { removeUser } from '../store/slices/userSlice';
import moment from 'moment';
// import { getSrc, getAvatar } from "./tools_func";
// import { SERVER_URL } from "../const";
import isoToGcalDescription from "../tools/isoToGcalDescription";

function Week() {
    // const curUser = useSelector((state) => state.user);
    // const dispatch = useDispatch();

    const halfHours = fillArray(24);
    const days = fillArray(7);

    const [week, setWeek] = useState(getDates());
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
        const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
        const API_KEY = "AIzaSyD3exYUMZ-2Aa1rXAPVTH4SFAqx5iqkdqs";
        let CALENDAR_REGION = "en.ukrainian";

        fetch('http://ip-api.com/json/')
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(data => {
            CALENDAR_REGION = "en." + isoToGcalDescription[data.countryCode.toLowerCase()];
        })
        .then(() => {
            const url = `${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}`
            fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(data => {
                setHolidays(data.items);
            })
            .catch(err => {
                console.log("err", err);
            });
        })
        .catch(err => {
            console.log("err", err);
        });
    }, []);

    function getHolidaysOnDate(date) {
        return holidays.filter(holiday => {
            let start = moment(new Date(holiday.start.date)).startOf('day').toDate();
            date = moment(new Date(date)).startOf('day').toDate();
            return date - start == 0;
        });
    }

    function getDates() {
        let start = moment().startOf('isoWeek').startOf('day');
        let week = [];
        for (let i = 0; i < 7; i++) {
            week.push(start.format('llll'));
            start.add(1, "days");
        }
        return week;
    }
    
    return (
        <div className='week'>
            <table>
                <thead>
                    <tr>
                        <td/>
                        {
                            week.map(date => (
                                <td key={date}>
                                    {date}---
                                    {getHolidaysOnDate(date).map(holiday => (
                                        holiday.summary
                                    ))}
                                </td>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        halfHours.map(halfHour => (
                                <React.Fragment key={halfHour}>
                                    <tr>
                                        <td className='half_hour'>{halfHour}</td>
                                        {
                                            days.map((day) => (
                                                <td key={day}/>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td></td>
                                        {
                                            days.map((day) => (
                                                <td key={day}/>
                                            ))
                                        }
                                    </tr>
                                </React.Fragment>
                            )
                        )
                    }
                </tbody>
            </table>
        </div>
    );

    function fillArray(n) {
        let arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }
}

export default Week;

