const db = require("../models/init.js");
const { verifyJWTToken } = require('../token/tokenTools');
const ValidationError = require('../errors/ValidationError');
const { sendError } = require('../controllers/tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;
const UserCalendar = db.sequelize.models.user_calendar;

async function canUpdateCalendar(req, res, next) {
    const token = req.headers.authorization;
    const calendarId = req.params.calendar_id;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        const curUser = await User.findByPk(decoded.id);
        if (!curUser) {
            throw new ValidationError("Invalid token", 401);
        }

        const curUserCalendar = await UserCalendar.findOne({
            where: {
                user_id: decoded.id,
                calendar_id: calendarId
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

module.exports = canUpdateCalendar;

