import React, { useState, useEffect } from 'react';
// import { Link, NavLink } from "react-router-dom";
// import { useSelector, useDispatch } from 'react-redux';
// import { removeUser } from '../store/slices/userSlice';
import moment from 'moment';
import { Rnd } from 'react-rnd';
// import { getSrc, getAvatar } from "./tools_func";
// import { SERVER_URL } from "../const";
import PopUpCreateEvent from "../elements/PopUpCreateEvent";
import isoToGcalDescription from "../tools/isoToGcalDescription";

function Week() {
    // const curUser = useSelector((state) => state.user);
    // const dispatch = useDispatch();

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [dateForPopup, setDateForPopup] = useState(moment());

    const hours = fillArray(24);
    const days = fillArray(7);

    const [week, setWeek] = useState(getDates());
    const [holidays, setHolidays] = useState([]);
    
    const [width, setWidth] = useState(300);

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

    useEffect(() => {
        setNewWidth();
    }, []);

    window.addEventListener('resize', (e) => {
        setNewWidth();
    });
    
    return (
        <div className='week'>
            {
                isPopUpOpen &&
                <PopUpCreateEvent date={dateForPopup} setIsPopUpOpen={setIsPopUpOpen} />
            }
            {/* <Rnd className='event'
                size={{ width: width,  height: 50 }}>
            Rnd
            </Rnd> */}
            <table onClick={createEvent}>
                <thead>
                    <tr>
                        <th/>
                        {
                            week.map(date => (
                                <th key={date}>
                                    {date}---
                                    {getHolidaysOnDate(date).map(holiday => (
                                        holiday.summary
                                    ))}
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        hours.map(hour => (
                                <React.Fragment key={hour}>
                                    <tr>
                                        <td className='half_hour'>{hour}</td>
                                        {
                                            days.map((day) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={hour} />
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td></td>
                                        {
                                            days.map((day) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={+hour + 0.5} />
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

    function setNewWidth() {
        let td = document.querySelector('td');
        if (td) {
            setWidth(td.offsetWidth);
        }
    }

    function createEvent(event) {
        // console.log(event);
        // console.log(event.target.tagName == "TD");
        // // console.log(event.target.offsetWidth);
        
        setDateForPopup(moment(new Date(event.target.dataset.week)).add(event.target.dataset.time,'hours'));
        setIsPopUpOpen(true);
    }
}

export default Week;

