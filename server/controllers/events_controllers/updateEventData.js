const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendError } = require('../tools/sendError');
const { parseDate } = require('../tools/tools_func');
const { validateName, validateDescription, validateDate, validateColor } = require('../tools/dataValidation');

const Event = db.sequelize.models.event;

async function updateEventData(req, res) {
    const { name, description, dateFrom, dateTo, color } = req.body;
    const eventId = req.params.event_id;
    
    try {
        let event = await Event.findByPk(eventId);
        if (!event) {
            throw new ValidationError("No such event", 404);
        }

        if (name) {
            validateName(name);
            event.set({
                name
            });
        }
        if (description) {
            validateDescription(description);
            event.set({
                description
            });
        }
        if (dateFrom && dateTo) {
            validateDate(dateFrom, dateTo, event.category);
            event.set({
                date_from: parseDate(dateFrom),
                date_to: parseDate(dateTo)
            });
        }
        else if (dateFrom && !dateTo) {
            validateDate(dateFrom, event.date_to, event.category);
            event.set({
                date_from: parseDate(dateFrom)
            });
        }
        else if (!dateFrom && dateTo) {
            validateDate(event.date_from, dateTo, event.category);
            event.set({
                date_to: parseDate(dateTo)
            });
        }
        if (color) {
            validateColor(color);
            event.set({
                color
            });
        }

        event = await event.save();
    
        res.status(200)
            .json({
                id : event.id,
                name : event.name,
                description : event.description,
                category : event.category,
                dateFrom : event.date_from,
                dateTo: event.date_to,
                color: event.color,
                calendarId: event.calendar_id 
            });
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = updateEventData;

