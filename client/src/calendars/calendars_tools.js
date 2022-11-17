import moment from 'moment';
import { SERVER_URL } from "../const";

function fillArray(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function getHolidaysOnDate(date, holidays) {
    return holidays.filter(holiday => {
        let start = moment(new Date(holiday.start.date)).startOf('day').toDate();
        date = moment(new Date(date)).startOf('day').toDate();
        return date - start == 0;
    });
}

function isAllDay(event) {
    if (event.category == "arrangement") {
        return false;
    }

    let day = moment(new Date(event.dateFrom));
    return moment(day).startOf('days').format('llll') == moment(new Date(event.dateFrom)).format('llll')
            && moment(day).endOf('days').format('llll') == moment(new Date(event.dateTo)).format('llll');
}

function getAllDayEvents(date, events) {
    return events.filter(event => {
        if (!isAllDay(event)) {
            return false;
        }

        let start = moment(new Date(event.dateFrom)).startOf('day').toDate();
        date = moment(new Date(date)).startOf('day').toDate();
        return date - start == 0;
    });
}

function getEventColor(event, calendars) {
    if (event.color) {
        return { backgroundColor: event.color };
    }
    
    const calendar = calendars.find(calendar => calendar.id == event.calendarId);
    return { backgroundColor: calendar[`${event.category}Color`] };
}

function updateEvent(eventId, body, curUser, successFunction, deleteUser) {
    fetch(SERVER_URL + `/api/events/${eventId}}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'authorization': curUser.token
        },
        body: JSON.stringify(body)
    })
    .then((response) => {
        if (!response.ok) {
            throw response;
        }
        successFunction();
    })
    .catch((err) => {
        console.log('err', err, err.body);
        switch(err.status) {
            case 401:
            case 403:
                deleteUser();
                window.location.href = '/login';
                break;
            default:
                window.location.href = '/error';
        }
    });
}

function deleteEvent(eventId, curUser, successFunc, deleteUser) {
    fetch(SERVER_URL + `/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'authorization': curUser.token
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw response;
        }
        else {
            successFunc();
        }
    })
    .catch((err) => {
        console.log('err', err, err.body);
        switch(err.status) {
            case 401:
            case 403:
                deleteUser();
                window.location.href = '/login';
                break;
            default:
                window.location.href = '/error';
        }
    });
}

export {
    fillArray,
    getHolidaysOnDate,
    isAllDay,
    getAllDayEvents,
    getEventColor,
    updateEvent,
    deleteEvent
};

