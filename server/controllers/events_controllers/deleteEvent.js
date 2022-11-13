const db = require("../../models/init.js");
const { sendError } = require('../tools/sendError');

const Event = db.sequelize.models.event;

async function deleteEvent(req, res) {
    const eventId = req.params.event_id;
    
    try {
        await Event.destroy({
            where: {
                id: eventId
            }
        });
        
        res.status(204).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = deleteEvent;

