import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurDate, setRepresentation } from '../store/slices/calendarsSlice';
import moment from 'moment';
import PopUpGetEventInfo from "./PopUpGetEventInfo";
import { getEventCompletedClassName, getDateString } from "../calendars/calendars_tools";

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
                <div className='icon close' onClick={() => {setIsPopUpOpen(false)}}>
                    <iconify-icon icon="material-symbols:close" />
                </div>
                <div className="cur_date button" onClick={showThatDayOnWeek}>
                    {moment(new Date(date)).format('ddd, Do MMMM YYYY')}
                </div>
                {holidays.map((holiday, index) => (
                    <div className='holiday' key={index}>{holiday.summary}</div>
                ))}
                <div>
                    {
                        events.map(event => (
                            <div key={event.id} className={'event' + getEventCompletedClassName(event)}
                                onClick={() => {openEventPopup(event)}}>
                                <span className='event_name'>{event.name}</span>, <span className='event_date'>{getDateString(event)}</span>
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

