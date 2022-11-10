import React, { useState, useEffect } from 'react';
// import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import moment from 'moment';
import { Rnd } from 'react-rnd';
// import { getSrc, getAvatar } from "./tools_func";
import { SERVER_URL } from "../const";
import PopUpCreateEvent from "../elements/PopUpCreateEvent";
import isoToGcalDescription from "../tools/isoToGcalDescription";

function Week() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [dateForPopup, setDateForPopup] = useState(moment());

    const hours = fillArray(24);
    const days = fillArray(7);

    const [week, setWeek] = useState(getDates());
    const [holidays, setHolidays] = useState([]);
    const [events, setEvents] = useState([]);
    
    const [widthTD, setWidthTD] = useState(300);
    const [heightTD, setHeightTD] = useState(100);

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
        setNewSizes();
    }, []);
    
    window.addEventListener('resize', (e) => {
        setNewSizes();
    });

    useEffect(() => {
        fetch(SERVER_URL + `/api/events?` + new URLSearchParams(
            {
                calendarIds: curCalendars.calendars.map((calendar => calendar.id)).join(','),
                dateFrom: week[0],
                dateTo: moment(new Date(week[week.length - 1])).add(1, "days").format('llll')
            }
        ),
        {
            method: 'GET',
            headers: {
                'authorization': curUser.token
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            setEvents(data);
        })
        .catch((err) => {
            console.log('err', err, err.body);
            switch(err.status) {
                case 401:
                case 403:
                    dispatch(removeUser());
                    window.location.href = '/login';
                    break;
                default:
                    window.location.href = '/error';
            }
        });
    }, []);
    
    return (
        <div className='week'>
            {
                isPopUpOpen &&
                <PopUpCreateEvent date={dateForPopup} setIsPopUpOpen={setIsPopUpOpen} />
            }
            {/* <Rnd className='event'
                size={{ width: widthTD,  height: heightTD }}>
                Rnd
            </Rnd> */}
            {console.log("ttt", widthTD, heightTD)}
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
                                        {/* {
                                            days.map((day) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={hour} />
                                            ))
                                        } */}
                                        {
                                            days.map((day, index) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={hour}
                                                    id={"td" + (hour + index)}>
                                                    {
                                                        (hour == 0 && index == 0) &&
                                                        <>
                                                            {
                                                                events.map(event => (
                                                                    <Rnd key={event.id} className='event' 
                                                                        // size={getEventSize(event)}
                                                                        // position={getEventPosition(event)}
                                                                        style={getStyle()}>
                                                                        Rnd
                                                                    </Rnd>
                                                                ))
                                                            }
                                                            {/* <div className='event' style={getStyle()}>hhhh</div> */}
                                                        </>
                                                    }
                                                </td>
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

    function setNewSizes() {
        let td = document.querySelector('td');
        if (td) {
            setWidthTD(td.offsetWidth);
            setHeightTD(td.offsetHeight);
        }
    }

    function createEvent(event) {
        if (event.target.tagName == 'TD') {
            setDateForPopup(moment(new Date(event.target.dataset.week)).add(event.target.dataset.time,'hours'));
            setIsPopUpOpen(true);
        }
    }

    function getEventSize(event) {
        if (event.category != "arrangement") {
            return {
                width: widthTD,
                height: 20
            };  
        }

        let height = new Date(event.dateTo) - new Date(event.dateFrom);
        height /= 1000 * 60 * 60;
        height *= heightTD * 2;

        return {
            width: widthTD,
            height
        };
    }

    function getStyle() {
        return {top: 0};
    }

    function getEventPosition(event) {
        // console.log('jjj');
        let date = (new Date(event.dateFrom));

        let x = week.findIndex(day => day == moment(date).startOf('days').format('llll'));
        x = widthTD * x;

        let y = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        y /= 60 * 60;
        y *= heightTD * 2;

        // console.log(y, event.dateFrom);

        // let td = document.querySelector('td');
        // if (td) {
        //     setWidthTD(td.offsetWidth);
        //     setHeightTD(td.offsetHeight);
        // }

        // let th = document.querySelector('th');
        // if (th) {
        //     console.log('th', th.offsetWidth, th.offsetHeight);
        // }

        return {
            x,
            y
        };
    }
}

export default Week;

