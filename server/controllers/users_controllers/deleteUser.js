const { Op } = require("sequelize");
const db = require("../../models/init.js");
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;
const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function deleteUser(req, res) {
    const token = req.headers.authorization;
    
    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        let userCalendars = await UserCalendar.findAll({
            where: {
                user_id: decoded.id
            },
            include: [
                {
                    model: Calendar,
                    include: [
                        {
                            model: UserCalendar
                        }
                    ]
                }
            ]
        });

        let deleteCalendarIds = [];

        userCalendars.forEach(userCalendar => {
            if (userCalendar.calendar.user_calendars.length == 1) {
                deleteCalendarIds.push(userCalendar.calendar.id);
            }
        });

        await User.destroy({
            where: {
                id: decoded.id
            },
            individualHooks: true
        });

        await Calendar.destroy({
            where: {
                id: {
                    [Op.in]: deleteCalendarIds
                }
            }
        });
        
        res.status(204).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = deleteUser;

