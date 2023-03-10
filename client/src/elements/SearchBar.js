import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import { getDateArr } from "../calendars/calendars_tools";
import PopUpGetEventInfo from "../popups/PopUpGetEventInfo";
import { SERVER_URL } from "../const";

function SearchBar() {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [search, setSearch] = useState('');
    const [events, setEvents] = useState([]);

    const [isPopUpGetEventInfoOpen, setIsPopUpGetEventInfoOpen] = useState(false);
    const [eventForPopupGetEventInfo, setEventForPopupGetEventInfo] = useState();

    useEffect(() => {
        if (search) {
            fetch(SERVER_URL + `/api/events?` + new URLSearchParams(
                {
                    search: search
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
        }
    }, [search]);

    return (
        <div className='search_container'>
            {
                isPopUpGetEventInfoOpen &&
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setCurEvent={setEventForPopupGetEventInfo} setEvents={setEvents} allEvents={events} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <input className="search_input input" value={search} onChange={handleChange} 
                    type="search" placeholder="Find event" />
            {search !== '' && events.length !== 0 && 
                <div className='options_container'>
                    {events.map(event => (
                        <div key={event.id} className="options"
                            onClick={() => {openEventPopup(event)}}>
                            <div>
                                <div className='event_name'>{event.name}</div>
                                <div>{getCalendar(event).name}</div> 
                            </div>
                            {getCurDateString(event)}
                        </div>
                    ))}
                </div>
            }
        </div>
    );

    function getCurDateString(event) {
        let dates = getDateArr(event);
        if (!dates[1]) {
            return (
                <div>
                    <div>{dates[0]}</div>
                </div>
            );
        }
        else {
            return (
                <div>
                    <div>{dates[0]}</div>
                    <div>{dates[1]}</div>
                </div>
            );
        }
    }

    function handleChange(event) {
        setSearch(event.target.value);
    }

    function getCalendar(event) {
        return curCalendars.calendars.find(calendar => calendar.id == event.calendarId);
    }

    function openEventPopup(event) {
        setEventForPopupGetEventInfo(event);
        setIsPopUpGetEventInfoOpen(true);
    }
}

export default SearchBar;

