import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurDate, setRepresentation } from '../store/slices/calendarsSlice';
import moment from 'moment';
import PopUpGetEventInfo from "./PopUpGetEventInfo";
import { getDateString } from "../tools/tools_func";

function PopUpMoreEvents({ events, setEvents, allEvents, holidays, date, setIsPopUpOpen }) {
    const dispatch = useDispatch();

    const [isPopUpGetEventInfoOpen, setIsPopUpGetEventInfoOpen] = useState(false);
    const [eventForPopupGetEventInfo, setEventForPopupGetEventInfo] = useState();

    return (
        <>
            {
                isPopUpGetEventInfoOpen &&
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setCurEvent={setEventForPopupGetEventInfo} setEvents={setEvents} allEvents={allEvents} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <div className="popup_background more_events" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container more_events">
                <div onClick={showThatDayOnWeek}>
                    {moment(new Date(date)).format('ddd, Do MMMM YYYY')}
                </div>
                {holidays.map(holiday => (
                    holiday.summary
                ))}
                <div>
                    {
                        events.map(event => (
                            <div key={event.id} className='event'
                                onClick={() => {openEventPopup(event)}}>
                                {event.name}, {getDateString(event.dateFrom)}{' - '}{getDateString(event.dateTo)}, {'' + event.completed}
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    );

    function openEventPopup(event) {
        setEventForPopupGetEventInfo(event);
        setIsPopUpGetEventInfoOpen(true);
    }

    function showThatDayOnWeek() {
        dispatch(setRepresentation({ representation: 'week' }));
        dispatch(setCurDate({ 
            curDate: moment(new Date(date))
        }));
        window.location.reload();
    }
}

export default PopUpMoreEvents;

