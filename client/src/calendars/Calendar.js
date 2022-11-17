import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import isoToGcalDescription from "../tools/isoToGcalDescription";

import Week from "./Week";
import Month from "./Month";

function Calendar() {
    const curCalendars = useSelector((state) => state.calendars);

    const [holidays, setHolidays] = useState([]);

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

    switch(curCalendars.representation) {
        case "month":
            return <Month holidays={holidays} widthTD={widthTD} heightTD={heightTD} />; 
        default:
            return <Week holidays={holidays} widthTD={widthTD} heightTD={heightTD} />; 
    }

    function setNewSizes() {
        let td = document.querySelector('td');
        if (td) {
            setWidthTD(td.getBoundingClientRect().width);
            setHeightTD(td.getBoundingClientRect().height);
        }
    }
}

export default Calendar;

