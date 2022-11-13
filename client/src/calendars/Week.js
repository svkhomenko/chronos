import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, removeScrollToY } from '../store/slices/calendarsSlice';
import moment from 'moment';
import { Rnd } from 'react-rnd';
import { SERVER_URL } from "../const";
import PopUpCreateEvent from "../popups/PopUpCreateEvent";
import PopUpGetEventInfo from "../popups/PopUpGetEventInfo";
import { fillArray, getHolidaysOnDate, isAllDay, updateEvent } from "./calendars_tools";
import isoToGcalDescription from "../tools/isoToGcalDescription";

function RndHeaderEvent({ event, styleColor, size, handleDragStop, openEventPopup }) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className='header_event' size={size}>
            <Rnd className='event_rnd' data-id={event.id}
                    style={styleColor}
                    size={size}
                    enableResizing={false}
                    dragAxis='x'
                    onDragStop={onBoxDragStop}
                    onDragStart={onBoxDragStart}>
                <div style={{height:'100%'}} onClick={handleClick}>
                    {event.name}
                </div>
            </Rnd>
        </div>
    );

    function handleClick() {
        if (isDragging) {
            return;
        }
        
        openEventPopup(event);
    }

    function onBoxDragStop(e, data) {
        setTimeout(() => {
            setIsDragging(false);
        }, 200);

        if (isDragging) {
            handleDragStop(e, data);
        }
    }
  
    function onBoxDragStart() {
        setTimeout(() => {
            setIsDragging(true);
        }, 200);
    }
}

function RndEvent({ event, stylePosition, styleColor, size, handleResizeStop, handleDragStop, openEventPopup }) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className='event' style={stylePosition}>
            <Rnd className='event_rnd' data-id={event.id}
                    style={styleColor}
                    size={size}
                    enableResizing={event.category != "arrangement" ? false : {top:true, right:false, bottom:true, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
                    onResizeStop={handleResizeStop}
                    onDragStop={onBoxDragStop}
                    onDragStart={onBoxDragStart}>
                <div style={{height:'100%'}} onClick={handleClick}>
                    {event.name}
                </div>
            </Rnd>
        </div>
    );

    function handleClick() {
        if (isDragging) {
            return;
        }
        
        openEventPopup(event);
    }

    function onBoxDragStop(e, data) {
        setTimeout(() => {
            setIsDragging(false);
        }, 200);

        if (isDragging) {
            handleDragStop(e, data);
        }
    }
  
    function onBoxDragStart() {
        setTimeout(() => {
            setIsDragging(true);
        }, 200);
    }
}

function Week() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [isPopUpCreateEventOpen, setIsPopUpCreateEventOpen] = useState(false);
    const [dateForPopupCreateEvent, setDateForPopupCreateEvent] = useState(moment());

    const [isPopUpGetEventInfoOpen, setIsPopUpGetEventInfoOpen] = useState(false);
    const [eventForPopupGetEventInfo, setEventForPopupGetEventInfo] = useState();

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
                calendarIds: curCalendars.calendars.filter(calendar => calendar.active)
                                                .map(calendar => calendar.id).join(','),
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
                isPopUpCreateEventOpen &&
                <PopUpCreateEvent date={dateForPopupCreateEvent} setIsPopUpOpen={setIsPopUpCreateEventOpen} />
            }
            {
                isPopUpGetEventInfoOpen &&
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <table onClick={createEvent}>
                <thead>
                    <tr>
                        <th/>
                        {
                            week.map(date => (
                                <th key={date}>
                                    {date}---
                                    {getHolidaysOnDate(date, holidays).map(holiday => (
                                        holiday.summary
                                    ))}----
                                    {moment(new Date(date)).isoWeek()}---
                                    {getAllDayEvents(date).map(event => (
                                        <RndHeaderEvent key={event.id}
                                                        event={event}
                                                        styleColor={getEventColor(event)}
                                                        size={getEventSize(event)}
                                                        handleDragStop={handleDragStop}
                                                        openEventPopup={openEventPopup} />
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
                                                                    <RndEvent key={event.id + '-' + index} 
                                                                            event={event}
                                                                            stylePosition={getStylePosition(event)}
                                                                            styleColor={getEventColor(event)}
                                                                            size={getEventSize(event)}
                                                                            handleResizeStop={handleResizeStop}
                                                                            handleDragStop={handleDragStop}
                                                                            openEventPopup={openEventPopup}/>
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

    function getEventColor(event) {
        if (event.color) {
            return { backgroundColor: event.color };
        }
        
        const calendar = curCalendars.calendars.find(calendar => calendar.id == event.calendarId);
        return { backgroundColor: calendar[`${event.category}Color`] };
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
            setWidthTD(td.getBoundingClientRect().width);
            setHeightTD(td.getBoundingClientRect().height);
        }
    }

    function createEvent(event) {
        if (event.target.tagName == 'TD') {
            setDateForPopupCreateEvent(moment(new Date(event.target.dataset.week)).add(event.target.dataset.time,'hours'));
            setIsPopUpCreateEventOpen(true);
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
        
        updateEvent(event.id, body, curUser, 
            () => {
                dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                window.location.reload();
            }, 
            () => {
                dispatch(removeUser());
            });
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
        
        updateEvent(event.id, body, curUser, 
            () => {
                dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                window.location.reload();
            }, 
            () => {
                dispatch(removeUser());
            });
    }

    function splitEventsIntoDays(data) {
        let splitEvents = [];

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

    function openEventPopup(event) {
        setEventForPopupGetEventInfo(event);
        setIsPopUpGetEventInfoOpen(true);
    }
}

export default Week;

