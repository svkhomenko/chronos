import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeMessage } from '../store/slices/calendarsSlice';

function Message() {
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    useEffect(() => {
        setTimeout(() => {
            dispatch(removeMessage());
        }, 3000);
    }, [curCalendars.message]);

    if (curCalendars.message) {
        return (
            <div className="popup_message">
                {curCalendars.message}
            </div>
        );
    }
}

export default Message;

