const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
const { sendEmailForInvite } = require('../tools/sendEmail');
require('dotenv').config();

const User = db.sequelize.models.user;
const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function addNewUsers(req, res) {
    const token = req.headers.authorization;
    const { userIds } = req.body;
    const calendarId = req.params.calendar_id;
    
    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);
        const curUser = await User.findByPk(decoded.id);
        if (!curUser) {
            throw new ValidationError("Invalid token", 401);
        }

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
            const user = await User.findByPk(userId);
            if (!user) {
                throw new ValidationError("No such user", 404);
            }
            await sendEmailForInvite(user.email, user.login, curUser.full_name, calendar.name);
        }));

        await Promise.all(userIds.map(async (userId) => {
            await UserCalendar.create({
                user_id: userId,
                calendar_id: calendarId
            });
        }));
        
        res.status(201).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = addNewUsers;

