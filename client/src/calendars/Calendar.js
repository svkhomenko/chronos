import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setCalendars } from '../store/slices/calendarsSlice';
import { SERVER_URL, API_KEY } from "../const";
import isoToGcalDescription from "../tools/isoToGcalDescription";

import Sidebar from "../elements/Sidebar";
import Week from "./Week";
import Month from "./Month";
import Year from "./Year";

function Calendar() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [holidays, setHolidays] = useState([]);

    const [widthTD, setWidthTD] = useState(300);
    const [heightTD, setHeightTD] = useState(100);

    useEffect(() => {
        fetch(SERVER_URL + `/api/calendars`, 
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
            let activeCalendar = curCalendars.calendars.filter(calendar => calendar.active);
            let calendars = [];
            if (activeCalendar.length == 0) {
                calendars = data.map(calendar => ({
                    ...calendar,
                    active: true
                }));
            }
            else {
                calendars = data.map(calendar => ({
                    ...calendar,
                    active: !!(activeCalendar.find(c => c.id == calendar.id))
                }));
            }

            calendars.sort((a, b) => {
                if (a.status == "main") {
                    return -1;
                }
                if (a.userRole == "admin" && b.userRole == "user") {
                    return -1;
                }
                return 0;
            });

            dispatch(setCalendars({ 
                calendars: calendars
            }));
        })
        .catch((err) => {
            console.log('err', err, err.body);
            switch(err.status) {
                case 401:
                    dispatch(removeUser());
                    window.location.href = '/login';
                    break;
                default:
                    window.location.href = '/error';
            }
        });
    }, []);

    useEffect(() => {
        if (API_KEY) {
            const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
            const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";
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
        }
    }, []);

    useEffect(() => {
        setNewSizes();
    }, []);

    useEffect(() => {
        setNewSizes();
    }, [curCalendars.calendars[0]]);
    
    window.addEventListener('resize', (e) => {
        setNewSizes();
    });

    switch(curCalendars.representation) {
        case "month":
            return (<>
                <Sidebar />
                {
                    curCalendars.calendars[0] &&
                    <Month holidays={getHolidays()} widthTD={widthTD} heightTD={heightTD} />
                }
            </>);
        case "year":
            return (<>
                <Sidebar />
                {
                    curCalendars.calendars[0] &&
                    <Year holidays={getHolidays()} />
                }
            </>);
        default:
            return (<>
                <Sidebar />
                {
                    curCalendars.calendars[0] &&
                    <Week holidays={getHolidays()} widthTD={widthTD} heightTD={heightTD} />
                }
            </>);
    }

    function setNewSizes() {
        let td = document.querySelector('td');
        if (td) {
            setWidthTD(td.getBoundingClientRect().width);
            setHeightTD(td.getBoundingClientRect().height);
        }
    }

    function getHolidays() {
        if (curCalendars.isHolidaysActive) {
            return holidays;
        }
        return [];
    }
}

export default Calendar;

