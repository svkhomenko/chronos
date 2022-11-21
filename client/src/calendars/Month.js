import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { setScrollToY, removeScrollToY, setCurDate, setRepresentation } from '../store/slices/calendarsSlice';
import moment from 'moment';
import { Rnd } from 'react-rnd';
import { SERVER_URL } from "../const";
import PopUpCreateEvent from "../popups/PopUpCreateEvent";
import PopUpGetEventInfo from "../popups/PopUpGetEventInfo";
import PopUpMoreEvents from "../popups/PopUpMoreEvents";
import { fillArray, getHolidaysOnDate, getEventColor, eventsSort, updateEvent } from "./calendars_tools";

function RndHeaderEvent({ event, styleColor, size, handleDragStop, openEventPopup }) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className='header_event' size={size}>
            <Rnd className='event_rnd' data-id={event.id}
                    style={styleColor}
                    size={size}
                    enableResizing={false}
                    onDragStop={onBoxDragStop}
                    onDragStart={onBoxDragStart} >
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

function EventsForDay({ events, setEvents, allEvents, date, holidays, getEventColor, widthTD, handleDragStop, openEventPopup }) {
    const curCalendars = useSelector((state) => state.calendars);
    const maxEvents = 3 - holidays.length;

    const [isPopUpMoreEventsOpen, setIsPopUpMoreEventsOpen] = useState(false);

    return (
        <>
            {
                isPopUpMoreEventsOpen &&
                <PopUpMoreEvents events={events} setEvents={setEvents} allEvents={allEvents} holidays={holidays} date={date} setIsPopUpOpen={setIsPopUpMoreEventsOpen} />
            }
            {(events.slice(0, maxEvents)).map(event => (
                <RndHeaderEvent key={event.id}
                            event={event}
                            styleColor={getEventColor(event, curCalendars.calendars)}
                            size={{width: widthTD}}
                            handleDragStop={handleDragStop}
                            openEventPopup={openEventPopup} />
            ))}
            {
                events.length > maxEvents &&
                <div onClick={showMoreEvents} className='more_events'>
                    {`${events.length - maxEvents} more event${events.length == maxEvents + 1 ? '' : 's'}`}
                </div>
            }
        </>
    );

    function showMoreEvents() {
        setIsPopUpMoreEventsOpen(true);
    }
}

function Month({ holidays, widthTD, heightTD }) {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [month, setMonth] = useState(getDates());
    const rows = fillArray(month.length / 7);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [events, setEvents] = useState([]);

    const [isPopUpCreateEventOpen, setIsPopUpCreateEventOpen] = useState(false);
    const [dateForPopupCreateEvent, setDateForPopupCreateEvent] = useState(moment());

    const [isPopUpGetEventInfoOpen, setIsPopUpGetEventInfoOpen] = useState(false);
    const [eventForPopupGetEventInfo, setEventForPopupGetEventInfo] = useState();

    useEffect(() => {
        fetch(SERVER_URL + `/api/events?` + new URLSearchParams(
            {
                calendarIds: curCalendars.calendars.filter(calendar => calendar.active)
                                                .map(calendar => calendar.id).join(','),
                dateFrom: month[0],
                dateTo: moment(new Date(month[month.length - 1])).add(1, "days").format('llll')
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

    useEffect(() => {
        if (curCalendars.scrollToY !== undefined) {
            window.scrollTo(0, curCalendars.scrollToY);
            dispatch(removeScrollToY());
        }
    }, []);

    return (
        <div className='month'>
            {
                isPopUpCreateEventOpen &&
                <PopUpCreateEvent date={dateForPopupCreateEvent} setIsPopUpOpen={setIsPopUpCreateEventOpen} />
            }
            {
                isPopUpGetEventInfoOpen &&
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setCurEvent={setEventForPopupGetEventInfo} setEvents={setEvents} allEvents={events} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <table>
                <thead>
                    <tr>
                        {daysOfWeek.map(dayOfWeek => (
                            <th key={dayOfWeek}>{dayOfWeek}</th>
                        ))}
                    </tr>
                </thead>
                <tbody onClick={createEvent}>
                    {rows.map(row => (
                        <tr key={row}>
                            {(month.slice(row * 7, (row + 1) * 7)).map(date => {
                                let hols = getHolidaysOnDate(date, holidays);
                                return (
                                    <td key={date} data-date={date}>
                                        <div onClick={() => {showThatDayOnWeek(date)}}>
                                            {moment(new Date(date)).format('D MMM')}
                                        </div>
                                        ----
                                        {hols.map(holiday => (
                                            holiday.summary
                                        ))}----   
                                        <EventsForDay events={getEventsForThisDay(date)}
                                                    setEvents={setEvents}
                                                    allEvents={events}
                                                    date={date}
                                                    holidays={hols}
                                                    getEventColor={getEventColor}
                                                    widthTD={widthTD}
                                                    handleDragStop={handleDragStop}
                                                    openEventPopup={openEventPopup} />                                                  
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    function getDates() {
        let start = moment(new Date(curCalendars.curDate)).startOf('month').startOf('isoWeek').startOf('day');
        let end = moment(new Date(curCalendars.curDate)).endOf('month').endOf('isoWeek').startOf('day');
        let month = [];
        while (!start.isAfter(end)) {
            month.push(start.format('llll'));
            start.add(1, "days");
        }
        return month;
    }

    function openEventPopup(event) {
        setEventForPopupGetEventInfo(event);
        setIsPopUpGetEventInfoOpen(true);
    }

    function handleDragStop(e, data) {
        let td = getTdFromPoint(e.clientX, e.clientY);
        if (!td) {
            dispatch(setScrollToY({scrollToY: window.pageYOffset}));
            window.location.reload();
            return;
        }
        let newDate = td.dataset.date;
        
        let event = events.find(event => event.id == data.node.dataset.id);
        let deltaDays = moment(new Date(event.dateTo)).startOf('day').diff(moment(new Date(newDate)), 'days');

        if (deltaDays) {
            let body = {};

            body.dateFrom = moment(new Date(event.dateFrom)).subtract(deltaDays, "days");
            body.dateTo = moment(new Date(event.dateTo)).subtract(deltaDays, "days");

            updateEvent(event.id, body, curUser, 
                () => {
                    dispatch(setScrollToY({scrollToY: window.pageYOffset}));
                    window.location.reload();
                }, 
                () => {
                    dispatch(removeUser());
                });
        }
        else {
            dispatch(setScrollToY({scrollToY: window.pageYOffset}));
            window.location.reload();
        }

        function getTdFromPoint(x, y) {
            var elements = [];
            var display = [];
            var item = document.elementFromPoint(x, y);
            while (item && item !== document.body && item !== window && item !== document && item !== document.documentElement) {
                if (item.tagName == 'TD') {
                    break;
                }
                elements.push(item);
                display.push(item.style.display);
                item.style.display = "none";
                item = document.elementFromPoint(x, y);
            }
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.display = display[i];
            }
            if (item && item.tagName == 'TD') {
                return item;
            }
            return null;
        }
    }

    function getEventsForThisDay(date) {
        date = moment(new Date(date));
        let ev = events.filter(event => {
            let dateFrom = moment(new Date(event.dateFrom));
            if (event.category == 'arrangement') {
                let dateTo = moment(new Date(event.dateTo));
                return date.isBetween(dateFrom, dateTo) || date.isSame(dateFrom, "day") || date.isSame(dateTo, "day");
            }
            else {
                return date.isSame(dateFrom, "day");
            }
        });

        ev.sort(eventsSort);

        return ev;
    }

    function createEvent(event) {
        if (event.target.tagName == 'TD') {
            setDateForPopupCreateEvent(moment(new Date(event.target.dataset.date)));
            setIsPopUpCreateEventOpen(true);
        }
    }

    function showThatDayOnWeek(date) {
        dispatch(setRepresentation({ representation: 'week' }));
        dispatch(setCurDate({ 
            curDate: moment(new Date(date))
        }));
        window.location.reload();
    }
}

export default Month;

