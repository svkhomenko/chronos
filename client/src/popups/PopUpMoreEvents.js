import React, { useState } from 'react';
import moment from 'moment';
import PopUpGetEventInfo from "./PopUpGetEventInfo";
import { getDateString } from "../tools/tools_func";

function PopUpMoreEvents({ events, date, setIsPopUpOpen }) {
    const [isPopUpGetEventInfoOpen, setIsPopUpGetEventInfoOpen] = useState(false);
    const [eventForPopupGetEventInfo, setEventForPopupGetEventInfo] = useState();

    return (
        <>
            {
                isPopUpGetEventInfoOpen &&
                <PopUpGetEventInfo curEvent={eventForPopupGetEventInfo} setIsPopUpOpen={setIsPopUpGetEventInfoOpen} />
            }
            <div className="popup_background more_events" onClick={() => {setIsPopUpOpen(false)}} />
            <div className="popup_container more_events">
                <div>{moment(new Date(date)).format('ddd, Do MMMM YYYY')}</div>
                <div >
                    {
                        events.map(event => (
                            <div key={event.id} className='event'
                                onClick={() => {openEventPopup(event)}}>
                                {event.name}, {getDateString(event.dateFrom)}{' - '}{getDateString(event.dateTo)}
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
}

export default PopUpMoreEvents;

