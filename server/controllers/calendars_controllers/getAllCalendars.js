const db = require("../../models/init.js");
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function getAllCalendars(req, res) {
    const token = req.headers.authorization;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        let calendars = await Calendar.findAll({
            include: [
                {
                    model: UserCalendar,
                    where: {
                        user_id: decoded.id
                    }
                }
            ]
        });

        calendars = calendars.map(calendar => ({
            id: calendar.id,
            name: calendar.name,
            description: calendar.description,
            arrangementColor: calendar.arrangement_color,
            reminderColor: calendar.reminder_color,
            taskColor: calendar.task_color,
            status: calendar.status,
            userRole: calendar.user_calendars[0].user_role
        }));

        res.status(200)
            .json(calendars);
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = getAllCalendars;

