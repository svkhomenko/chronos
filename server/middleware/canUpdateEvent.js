const db = require("../models/init.js");
const { verifyJWTToken } = require('../token/tokenTools');
const ValidationError = require('../errors/ValidationError');
const { sendError } = require('../controllers/tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;
const Event = db.sequelize.models.event;
const UserCalendar = db.sequelize.models.user_calendar;

async function canUpdateEvent(req, res, next) {
    const token = req.headers.authorization;
    const eventId = req.params.event_id;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        const curUser = await User.findByPk(decoded.id);
        if (!curUser) {
            throw new ValidationError("Invalid token", 401);
        }

        const curEvent = await Event.findByPk(eventId);
        if (!curEvent) {
            throw new ValidationError("No such event", 404);
        }

        const curUserCalendar = await UserCalendar.findOne({
            where: {
                user_id: decoded.id,
                calendar_id: curEvent.calendar_id
            }
        });
        if (!curUserCalendar) {
            throw new ValidationError("Forbidden data", 403); 
        }
        
        next();
    } catch (err) {
        sendError(err, res);
    }
}

module.exports = canUpdateEvent;

