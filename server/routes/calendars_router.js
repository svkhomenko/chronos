const express = require("express");
const calendarsController = require('../controllers/calendars_controllers/calendars_controller');
const isAuth = require("../middleware/isAuth");
const canUpdateCalendar = require("../middleware/canUpdateCalendar");
const calendarsRouter = express.Router();

calendarsRouter.get("/", isAuth, calendarsController.getAllCalendars);
// calendarsRouter.get("/:user_id", isAuth, calendarsController.getUserById);
// calendarsRouter.get("/:user_id/rating", calendarsController.getRatingById);
calendarsRouter.post("/", isAuth, calendarsController.createNewCalendar);
calendarsRouter.post("/:calendar_id/events", canUpdateCalendar, calendarsController.createNewEvent);
// calendarsRouter.patch("/avatar", isAuth, avatarUpload, evencalendarsControllertsController.uploadAvatar);
calendarsRouter.patch("/:calendar_id", canUpdateCalendar, calendarsController.updateCalendarData);
calendarsRouter.delete("/:calendar_id", canUpdateCalendar, calendarsController.deleteCalendar);

module.exports = calendarsRouter;

