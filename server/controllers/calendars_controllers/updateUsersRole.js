const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendError } = require('../tools/sendError');
const { validateRole } = require('../tools/dataValidation');

const User = db.sequelize.models.user;
const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function updateUsersRole(req, res) {
    const { role } = req.body;
    const calendarId = req.params.calendar_id;
    const userId = req.params.user_id;
    
    try {
        const calendar = await Calendar.findByPk(calendarId);
        if (!calendar) {
            throw new ValidationError("No such calendar", 404);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new ValidationError("No such user", 404);
        }

        let userCalendar = await UserCalendar.findOne({
            where: {
                user_id: userId,
                calendar_id: calendarId
            }
        });
        if (!userCalendar) {
            throw new ValidationError("Forbidden data", 403); 
        }

        validateRole(role);
        userCalendar.set({
            user_role: role
        });
        userCalendar = await userCalendar.save();
        
        res.status(201).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = updateUsersRole;

