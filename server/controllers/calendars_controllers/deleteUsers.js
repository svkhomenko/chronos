const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendError } = require('../tools/sendError');

const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function deleteUsers(req, res) {
    const { userIds } = req.body;
    const calendarId = req.params.calendar_id;
    
    try {
        const calendar = await Calendar.findByPk(calendarId);
        if (!calendar) {
            throw new ValidationError("No such calendar", 404);
        }

        if (!userIds) {
            throw new ValidationError("User's ids are required", 400);
        }

        if (!Array.isArray(userIds)) {
            throw new ValidationError("User's ids must be array", 400);
        }

        await Promise.all(userIds.map(async (userId) => {
            await UserCalendar.destroy({
                where: {
                    user_id: userId,
                    calendar_id: calendarId
                }
            });
        }));
        
        res.status(204).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = deleteUsers;

