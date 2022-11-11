const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendError } = require('../tools/sendError');
const { parseDate } = require('../tools/tools_func');
const { validateName, validateDescription, validateCategory, validateDate, validateColor } = require('../tools/dataValidation');

const Calendar = db.sequelize.models.calendar;
const Event = db.sequelize.models.event;

async function createNewEvent(req, res) {
    const { name, description, category, dateFrom, dateTo, color } = req.body;
    const calendarId = req.params.calendar_id;
    
    try {
        validateName(name);
        validateDescription(description);
        validateCategory(category);
        validateDate(dateFrom, dateTo, category);
        validateColor(color);

        const calendar = await Calendar.findByPk(calendarId);
        if (!calendar) {
            throw new ValidationError("No such calendar", 404);
        }
        
        const event = await Event.create({
            name,
            description,
            category,
            date_from: parseDate(dateFrom),
            date_to: parseDate(dateTo),
            color,
            calendar_id: calendarId
        });
        
        res.setHeader("Location", `/api/events/${event.id}`)
            .status(201).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = createNewEvent;

