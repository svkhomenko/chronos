import React, { useState, useEffect } from 'react';
// import { Link, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, removeScrollToY } from '../store/slices/calendarsSlice';
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
        if (curCalendars.scrollToY) {
            window.scrollTo(0, curCalendars.scrollToY);
            dispatch(removeScrollToY());
        }
    });

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
                                    ))}----
                                    {moment(new Date(date)).isoWeek()}---
                                    {getAllDayEvents(date).map(event => (
                                        <div key={event.id} className='header_event' size={getEventSize(event)}>
                                            <Rnd className='event_rnd' data-id={event.id}
                                                    size={getEventSize(event)}
                                                    enableResizing={false}
                                                    dragAxis='x'
                                                    onDragStop={handleDragStop}>
                                                {event.name}
                                            </Rnd>
                                        </div>
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
                                            days.map((day, index) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={hour}
                                                    id={"td" + (hour + index)}>
                                                    {
                                                        (hour == 0 && index == 0) &&
                                                        <>
                                                            {                                                       
                                                                splitEventsIntoDays(events).map((event, index) => (
                                                                    <div key={event.id + '-' + index} className='event' style={getStylePosition(event)}>
                                                                        <Rnd className='event_rnd' data-id={event.id}
                                                                                size={getEventSize(event)}
                                                                                enableResizing={event.category != "arrangement" ? false : {top:true, right:false, bottom:true, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
                                                                                onResizeStop={handleResizeStop}
                                                                                onDragStop={handleDragStop}>
                                                                            {event.name}
                                                                        </Rnd>
                                                                    </div>
                                                                ))
                                                            }
                                                        </>
                                                    }
                                                </td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td/>
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

    function getAllDayEvents(date) {
        return events.filter(event => {
            if (!isAllDay(event)) {
                return false;
            }

            let start = moment(new Date(event.dateFrom)).startOf('day').toDate();
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
            width: widthTD / event.widthCollision,
            height
        };
    }

    function getStylePosition(event) {
        let date = (new Date(event.dateFrom));

        let left = week.findIndex(day => day == moment(date).startOf('days').format('llll'));
        left = widthTD * left;
        left += event.numberInWidthCollision * widthTD / event.widthCollision;

        let top = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
        top /= 60 * 60;
        top *= heightTD * 2;

        return {
            left: left + 'px',
            top: top + 'px'
        };
    }

    function handleResizeStop(e, direction, ref, delta, position) {
        let event = events.find(event => event.id == ref.dataset.id);
        let deltaHours = delta.height / (heightTD * 2);

        let body = {};
        if (direction == "bottom") {
            body.dateTo = moment(new Date(event.dateTo)).add(deltaHours, "hours");
        }
        else if (direction == "top") {
            body.dateFrom = moment(new Date(event.dateFrom)).subtract(deltaHours, "hours");
        }
        
        updateEvent(event.id, body);
    }

    function handleDragStop(e, data) {
        let event = events.find(event => event.id == data.node.dataset.id);
        let deltaHours = data.y / (heightTD * 2);

        let body = {};
        body.dateTo = moment(new Date(event.dateTo)).add(deltaHours, "hours");
        body.dateFrom = moment(new Date(event.dateFrom)).add(deltaHours, "hours");

        let deltaDays = Math.round(data.x / widthTD);
        if (deltaDays) {
            body.dateTo = moment(body.dateTo).add(deltaDays, "days");
            body.dateFrom = moment(body.dateFrom).add(deltaDays, "days");
        }
        
        updateEvent(event.id, body);
    }

    function updateEvent(eventId, body) {
        fetch(SERVER_URL + `/api/events/${eventId}}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': curUser.token
            },
            body: JSON.stringify(body)
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            dispatch(setScrollToY({scrollToY: window.pageYOffset}));
            window.location.reload();
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
    }

    function isAllDay(event) {
        if (event.category == "arrangement") {
            return false;
        }

        let day = moment(new Date(event.dateFrom));
        return moment(day).startOf('days').format('llll') == moment(new Date(event.dateFrom)).format('llll')
                && moment(day).endOf('days').format('llll') == moment(new Date(event.dateTo)).format('llll');
    }

    function splitEventsIntoDays(data) {
        let splitEvents = [];

        // data.forEach(event => {
        //     if (!isAllDay(event)) {
        //         let dateFrom = moment(event.dateFrom);
        //         let dateTo = moment(event.dateTo);
        //         if (event.category == "arrangement") {
        //             while (moment(dateFrom).startOf('days').format('llll') != moment(dateTo).startOf('days').format('llll')) {
        //                 splitEvents.push({
        //                     ...event,
        //                     dateFrom: moment(dateFrom).format('llll'),
        //                     dateTo: moment(dateFrom).endOf('days').format('llll')
        //                 });
        
        //                 dateFrom = moment(dateFrom).add(1, "days").startOf('days');
        //             }
        //         }
        //         splitEvents.push({
        //             ...event,
        //             dateFrom: dateFrom.format('llll'),
        //             dateTo: dateTo.format('llll')
        //         });
        //     }
        // });

        data = data.filter(event => !isAllDay(event));

        data = data.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        let temp = [];
        data.forEach(event => {
            event.numberInWidthCollision = 0;
            temp = temp.filter(tempEvent => new Date(tempEvent.dateTo) - new Date(event.dateFrom) > 0);
            event.widthCollision = temp.length;
            event.numberInWidthCollision = temp.length;
            
            for (let i = 0; i < event.numberInWidthCollision; i++) {
                if (!temp.find(tempEvent => tempEvent.numberInWidthCollision == i)) {
                    event.numberInWidthCollision = i;
                    break;
                }
            }
            // if (event.numberInWidthCollision == temp[temp.length - 1].numberInWidthCollision) {           //// ????
            //     event.numberInWidthCollision
            // }

            temp.push(event);
            temp.forEach(tempEvent => tempEvent.widthCollision++);
        });

        data.forEach(event => {
            let dateFrom = moment(event.dateFrom);
            let dateTo = moment(event.dateTo);
            if (event.category == "arrangement") {
                while (moment(dateFrom).startOf('days').format('llll') != moment(dateTo).startOf('days').format('llll')) {
                    splitEvents.push({
                        ...event,
                        dateFrom: moment(dateFrom).format('llll'),
                        dateTo: moment(dateFrom).endOf('days').format('llll')
                    });
    
                    dateFrom = moment(dateFrom).add(1, "days").startOf('days');
                }
            }
            splitEvents.push({
                ...event,
                dateFrom: dateFrom.format('llll'),
                dateTo: dateTo.format('llll')
            });
        });

        return splitEvents;
    }
}

export default Week;

