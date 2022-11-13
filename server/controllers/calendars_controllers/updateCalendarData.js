const db = require("../../models/init.js");
const { sendError } = require('../tools/sendError');
const { validateName, validateDescription, validateColor } = require('../tools/dataValidation');

const Calendar = db.sequelize.models.calendar;

async function updateCalendarData(req, res) {
    const { name, description, arrangementColor, reminderColor, taskColor } = req.body;
    const calendarId = req.params.calendar_id;
    
    try {
        let calendar = await Calendar.findByPk(calendarId);
        if (!calendar) {
            throw new ValidationError("No such calendar", 404);
        }

        if (name) {
            validateName(name);
            calendar.set({
                name
            });
        }
        if (description) {
            validateDescription(description);
            calendar.set({
                description
            });
        }
        if (arrangementColor) {
            validateColor(arrangementColor);
            calendar.set({
                arrangement_color: arrangementColor
            });
        }
        if (reminderColor) {
            validateColor(reminderColor);
            calendar.set({
                reminder_color: reminderColor
            });
        }
        if (taskColor) {
            validateColor(taskColor);
            calendar.set({
                task_color: taskColor
            });
        }

        calendar = await calendar.save();

        res.status(200)
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

module.exports = updateCalendarData;

