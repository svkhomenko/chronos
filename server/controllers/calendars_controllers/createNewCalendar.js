const db = require("../../models/init.js");
const { sendError } = require('../tools/sendError');
const { verifyJWTToken } = require('../../token/tokenTools');
const { validateName, validateDescription, validateColor } = require('../tools/dataValidation');
require('dotenv').config();

const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function createNewCalendar(req, res) {
    const token = req.headers.authorization;
    const { name, description, arrangementColor, reminderColor, taskColor } = req.body;
    
    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        validateName(name);
        validateDescription(description);
        validateColor(arrangementColor);
        validateColor(reminderColor);
        validateColor(taskColor);
    
        const calendar = await Calendar.create({
            name,
            description,
            arrangement_color: (arrangementColor ? arrangementColor : undefined),
            reminder_color: (reminderColor ? reminderColor : undefined),
            task_color: (taskColor ? taskColor : undefined)
        });
    
        await UserCalendar.create({
            user_id: decoded.id,
            calendar_id: calendar.id,
            user_role: "admin"
        });

        res.status(201)
            .json({
                id: calendar.id,
                name: calendar.name,
                description: calendar.description,
                arrangementColor: calendar.arrangement_color,
                reminderColor: calendar.reminder_color,
                taskColor: calendar.task_color,
                status: calendar.status
            });
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = createNewCalendar;

