const express = require("express");
const eventsController = require('../controllers/events_controllers/events_controller');
const isAuth = require("../middleware/isAuth");
const canUpdateEvent = require("../middleware/canUpdateEvent");
const eventsRouter = express.Router();

eventsRouter.get("/", isAuth, eventsController.getAllEvents);
// eventsRouter.get("/:user_id", isAuth, eventsController.getUserById);
// eventsRouter.get("/:user_id/rating", eventsController.getRatingById);
// eventsRouter.post("/:calendar_id/events", eventsController, calendarsController.createNewEvent);
// eventsRouter.patch("/avatar", isAuth, avatarUpload, eventsController.uploadAvatar);
eventsRouter.patch("/:event_id", canUpdateEvent, eventsController.updateEventData);
eventsRouter.delete("/:event_id", canUpdateEvent, eventsController.deleteEvent);

module.exports = eventsRouter;

