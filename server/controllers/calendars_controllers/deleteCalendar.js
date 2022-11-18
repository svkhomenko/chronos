const db = require("../../models/init.js");
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function deleteCalendar(req, res) {
    const token = req.headers.authorization;
    const calendarId = req.params.calendar_id;
    const { forAll } = req.body;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        const curCalendar = await Calendar.findByPk(calendarId);
        if (!curCalendar) {
            throw new ValidationError("No such calendar", 404); 
        }
        if (curCalendar.status == 'main') {
            throw new ValidationError("You can not delete main calendar", 403); 
        }
    
        if (forAll) {
            const curUserCalendar = await UserCalendar.findOne({
                where: {
                    user_id: decoded.id,
                    calendar_id: calendarId
                }
            });
            if (!curUserCalendar || (curUserCalendar && curUserCalendar.user_role != 'admin')) {
                throw new ValidationError("Forbidden data", 403); 
            }
               
            await Calendar.destroy({
                where: {
                    id: calendarId
                }
            });
        }
        else {
            await UserCalendar.destroy({
                where: {
                    user_id: decoded.id,
                    calendar_id: calendarId
                }
            });

            let { count, rows } = await UserCalendar.findAndCountAll({
                where: {
                    calendar_id: calendarId
                }
            });

            if (count == 0) {
                await Calendar.destroy({
                    where: {
                        id: calendarId
                    }
                });
            }
            else {
                let { count, rows } = await UserCalendar.findAndCountAll({
                    where: {
                        calendar_id: calendarId,
                        user_role: 'admin'
                    }
                });

                if (count == 0) {
                    let userCalendar = await UserCalendar.findOne({
                        where: {
                            calendar_id: calendarId
                        }
                    });

                    userCalendar.set({
                        user_role: 'admin'
                    });
                    
                    await userCalendar.save();

                }
            }
        }

        res.status(204).send();
    }
    catch(err) {
        sendError(err, res);
    }
}

module.exports = deleteCalendar;

