import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeUser } from '../store/slices/userSlice';
import moment from 'moment';
import { SERVER_URL } from "../const";
import PopUpMoreEvents from "../popups/PopUpMoreEvents";
import { fillArray, getHolidaysOnDate, eventsSort, getCurDateClassName } from "./calendars_tools";

function Year({ holidays }) {
    const curUser = useSelector((state) => state.user);
    const curCalendars = useSelector((state) => state.calendars);
    const dispatch = useDispatch();

    const [year, setYear] = useState(getYear());

    const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const rows = fillArray(6);

    const [events, setEvents] = useState([]);
    const [date, setDate] = useState();
    const [isPopUpMoreEventsOpen, setIsPopUpMoreEventsOpen] = useState(false);

    return (
        <div className='year'>
            {
                isPopUpMoreEventsOpen &&
                <PopUpMoreEvents events={events} setEvents={setEvents} allEvents={events} holidays={getHolidaysOnDate(date, holidays)} date={date} setIsPopUpOpen={setIsPopUpMoreEventsOpen} />
            }
            {
                year.map(month => (
                    <div key={month.month} className='year_month'>
                        <table>
                            <thead>
                                <tr>
                                    <th colSpan='7' className='month_date'>
                                        {moment(month.month).format('MMMM')}
                                    </th>
                                </tr>
                                <tr>
                                    {daysOfWeek.map(dayOfWeek => (
                                        <th key={dayOfWeek}>{dayOfWeek}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row}>
                                        {(month.dates.slice(row * 7, (row + 1) * 7)).map(date => (
                                            <td key={date}>
                                                <div className={"day_date " + getClassNameCurMonth(month.month, date) + ' ' + getCurDateClassName(date, curCalendars.curDate)}
                                                        data-date={date}
                                                        onClick={getEventsForDate}>
                                                    {moment(new Date(date)).format('D')}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            }
        </div>
    );

    function getYear() {
        let start = moment(new Date(curCalendars.curDate)).startOf('year').startOf('day');
        let end = moment(new Date(curCalendars.curDate)).endOf('year').startOf('day');
        let year = [];
        while (!start.isAfter(end)) {
            year.push({
                month: moment(start),
                dates: getMonth(start)
            });
            start.add(1, "month");
        }
        return year;
    }

    function getMonth(date) {
        let start = moment(date).startOf('month').startOf('isoWeek').startOf('day');
        let end = moment(date).endOf('month').endOf('isoWeek').startOf('day');
        let month = [];
        while (!start.isAfter(end)) {
            month.push(start.format('llll'));
            start.add(1, "days");
        }
        if (month.length == 35) {
            end.add(1, "weeks");
            while (!start.isAfter(end)) {
                month.push(start.format('llll'));
                start.add(1, "days");
            }
        }
        return month;
    }

    function getClassNameCurMonth(month, date) {
        if (!moment(month).isSame(moment(new Date(date)), 'month')) {
            return 'not_cur_month_date';
        }
        return '';
    }

    function getEventsForDate(e) {
        fetch(SERVER_URL + `/api/events?` + new URLSearchParams(
            {
                calendarIds: curCalendars.calendars.filter(calendar => calendar.active)
                                                .map(calendar => calendar.id).join(','),
                dateFrom: e.target.dataset.date,
                dateTo: moment(new Date(e.target.dataset.date)).add(1, "days").format('llll')
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
            setEvents((data.sort(eventsSort)));
            setDate(e.target.dataset.date);
            setIsPopUpMoreEventsOpen(true);
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
}

export default Year;

