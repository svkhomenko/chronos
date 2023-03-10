import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, removeScrollToY } from '../store/slices/calendarsSlice';
import moment from 'moment';
import { Rnd } from 'react-rnd';
import { SERVER_URL } from "../const";
import PopUpCreateEvent from "../popups/PopUpCreateEvent";
import PopUpGetEventInfo from "../popups/PopUpGetEventInfo";
import { fillArray, getHolidaysOnDate, isAllDay, getAllDayEvents, getEventColor, getEventCompletedClassName, getCurDateClassName, updateEvent } from "./calendars_tools";

function RndHeaderEvent({ event, styleColor, size, handleDragStop, openEventPopup }) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className='header_event' size={size}>
            <Rnd className={'event_rnd ' + getEventCompletedClassName(event)} data-id={event.id}
                    style={styleColor}
                    size={size}
                    enableResizing={false}
                    dragAxis='x'
                    onDragStop={onBoxDragStop}
                    onDragStart={onBoxDragStart}>
                <div style={{height:'100%'}} onClick={handleClick} onTouchEnd={handleClick}>
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
            <Rnd className={'event_rnd ' + getEventCompletedClassName(event)} data-id={event.id}
                    style={styleColor}
                    size={size}
                    enableResizing={event.category != "arrangement" ? false : {top:true, right:false, bottom:true, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
                    onResizeStop={handleResizeStop}
                    onDragStop={onBoxDragStop}
                    onDragStart={onBoxDragStart}>
                <div style={{height:'100%'}} onClick={handleClick} onTouchEnd={handleClick}>
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

function Week({ holidays, widthTD, heightTD }) {
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
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (curCalendars.scrollToY !== undefined) {
            window.scrollTo(0, curCalendars.scrollToY);
            dispatch(removeScrollToY());
        }
    }, []);

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
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setCurEvent={setEventForPopupGetEventInfo} setEvents={setEvents} allEvents={events} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <table onClick={createEvent}>
                <thead>
                    <tr>
                        <th className='half_hour'/>
                        {
                            week.map(date => (
                                <th key={date} className={getCurDateClassName(date, curCalendars.curDate)}>
                                    <div className='date'>{moment(new Date(date)).format('ddd, D MMM')}</div>
                                    {getHolidaysOnDate(date, holidays).map((holiday, index) => (
                                        <div key={index}>{holiday.summary}</div>
                                    ))}
                                    {getAllDayEvents(date, events).map(event => (
                                        <RndHeaderEvent key={event.id}
                                                        event={event}
                                                        styleColor={getEventColor(event, curCalendars.calendars)}
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
                                                    id={"td" + (hour + index)}
                                                    className={getCurDateClassName(week[day], curCalendars.curDate)}>
                                                    {
                                                        (hour == 0 && index == 0) &&
                                                        <>
                                                            {                                                       
                                                                splitEventsIntoDays(events).map((event, index) => (
                                                                    <RndEvent key={event.id + '-' + index} 
                                                                            event={event}
                                                                            stylePosition={getStylePosition(event)}
                                                                            styleColor={getEventColor(event, curCalendars.calendars)}
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
                                        <td className='half_hour' />
                                        {
                                            days.map((day) => (
                                                <td key={day}
                                                    data-week={week[day]}
                                                    data-time={+hour + 0.5}
                                                    className={getCurDateClassName(week[day], curCalendars.curDate)} />
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

    function getDates() {
        let start = moment(new Date(curCalendars.curDate)).startOf('isoWeek').startOf('day');
        let week = [];
        for (let i = 0; i < 7; i++) {
            week.push(start.format('llll'));
            start.add(1, "days");
        }
        return week;
    }

    function createEvent(event) {
        if (event.target.tagName == 'TD' && event.target.dataset.week) {
            setDateForPopupCreateEvent(moment(new Date(event.target.dataset.week)).add(event.target.dataset.time,'hours'));
            setIsPopUpCreateEventOpen(true);
        }
    }

    function getEventSize(event) {
        if (event.category != "arrangement") {
            let width = widthTD;
            if (!isAllDay(event)) {
                width = widthTD / event.widthCollision
            }
            return {
                width: width,
                height: "23px"
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
                while (!moment(dateFrom).isSame(moment(dateTo), "days")) {
                    if (isNotAnotherWeek(dateFrom)) {
                        splitEvents.push({
                            ...event,
                            dateFrom: moment(dateFrom).format('llll'),
                            dateTo: moment(dateFrom).endOf('days').format('llll')
                        });
                    }
                    
                    dateFrom = moment(dateFrom).add(1, "days").startOf('days');
                }
            }
            if (isNotAnotherWeek(dateFrom)) {
                splitEvents.push({
                    ...event,
                    dateFrom: dateFrom.format('llll'),
                    dateTo: dateTo.format('llll')
                });
            }
        });

        return splitEvents;

        function isNotAnotherWeek(dateFrom) {
            return !(moment(dateFrom).isBefore(moment(new Date(week[0])), 'days') 
                || moment(dateFrom).isAfter(moment(new Date(week[week.length - 1])), 'days'));
        }
    }

    function openEventPopup(event) {
        let fullEvent = events.find(e => e.id == event.id);
        setEventForPopupGetEventInfo(fullEvent);
        setIsPopUpGetEventInfoOpen(true);
    }
}

export default Week;

