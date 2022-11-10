const express = require("express");
const eventsController = require('../controllers/events_controllers/events_controller');
const isAuth = require("../middleware/isAuth");
const eventsRouter = express.Router();

eventsRouter.get("/", isAuth, eventsController.getAllEvents);
// eventsRouter.get("/:user_id", isAuth, eventsController.getUserById);
// eventsRouter.get("/:user_id/rating", eventsController.getRatingById);
// eventsRouter.post("/:calendar_id/events", eventsController, calendarsController.createNewEvent);
// eventsRouter.patch("/avatar", isAuth, avatarUpload, eventsController.uploadAvatar);
// eventsRouter.patch("/:user_id", canUpdateUserData, eventsController, eventsController.uploadUserData);
// eventsRouter.delete("/:user_id", canUpdateUserData, eventsController.deleteUser);

module.exports = eventsRouter;

