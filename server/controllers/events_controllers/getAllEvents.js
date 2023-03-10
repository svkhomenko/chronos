const { Op } = require("sequelize");
const db = require("../../models/init.js");
const { verifyJWTToken } = require('../../token/tokenTools');
const ValidationError = require('../../errors/ValidationError');
const { sendError } = require('../tools/sendError');
const { parseDate } = require('../tools/tools_func');
require('dotenv').config();

const Event = db.sequelize.models.event;
const UserCalendar = db.sequelize.models.user_calendar;

async function getAllEvents(req, res) {
    const token = req.headers.authorization;
    let { calendarIds, dateFrom, dateTo, search } = req.query;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        let where = {};

        if (calendarIds) {
            calendarIds = req.query.calendarIds.split(',');

            await Promise.all(calendarIds.map(async (calendarId) => {
                const curUserCalendar = await UserCalendar.findOne({
                    where: {
                        user_id: decoded.id,
                        calendar_id: calendarId
                    }
                });
                if (!curUserCalendar) {
                    throw new ValidationError("Forbidden data", 403); 
                }
            }));

            where = {
                ...where,
                calendar_id: {
                    [Op.in]: calendarIds
                }
            }
        }

        if (dateFrom && dateTo) {
            let validFrom = (new Date(dateFrom)).getTime() > 0;
            let validTo = (new Date(dateTo)).getTime() > 0;

            if (!validFrom || !validTo) {
                throw new ValidationError("FilterDate is invalid", 400);
            }

            where = {
                ...where,
                [Op.or]: [
                    {
                        [Op.and]: [
                            {
                                date_from: {
                                    [Op.gte]: parseDate(dateFrom)
                                }
                            },
                            {
                                date_from: {
                                    [Op.lt]: parseDate(dateTo)
                                }
                            }
                        ]
                    },
                    {
                        [Op.and]: [
                            {
                                date_to: {
                                    [Op.gt]: parseDate(dateFrom)
                                }
                            },
                            {
                                date_to: {
                                    [Op.lte]: parseDate(dateTo)
                                }
                            }
                        ]
                    },
                    {
                        [Op.and]: [
                            {
                                date_from: {
                                    [Op.lte]: parseDate(dateFrom)
                                }
                            },
                            {
                                date_to: {
                                    [Op.gte]: parseDate(dateTo)
                                }
                            }
                        ]
                    }
                ]
            };
        }

        if (search) {
            where = {
                ...where,
                [Op.or]: [
                    { 
                        name: {
                            [Op.substring]: search
                        }
                    },
                    { 
                        description: {
                            [Op.substring]: search
                        }
                    },
                    { 
                        category: {
                            [Op.substring]: search
                        }
                    }
                ] 
            };
        }

        let events = await Event.findAll({
            where,
            limit: (search ? 10 : undefined)
        });

        events = events.map(event => ({
            id : event.id,
            name : event.name,
            description : event.description,
            category : event.category,
            dateFrom : event.date_from,
            dateTo: event.date_to,
            color: event.color,
            calendarId: event.calendar_id,
            completed: event.completed
        }));

        res.status(200)
            .json(events);
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = getAllEvents;

