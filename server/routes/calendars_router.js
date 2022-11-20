const express = require("express");
const calendarsController = require('../controllers/calendars_controllers/calendars_controller');
const isAuth = require("../middleware/isAuth");
const canUpdateCalendar = require("../middleware/canUpdateCalendar");
const canUpdateCalendarAsAdmin = require("../middleware/canUpdateCalendarAsAdmin");
const calendarsRouter = express.Router();

calendarsRouter.get("/", isAuth, calendarsController.getAllCalendars);
calendarsRouter.post("/", isAuth, calendarsController.createNewCalendar);
calendarsRouter.post("/:calendar_id/events", canUpdateCalendar, calendarsController.createNewEvent);
calendarsRouter.post("/:calendar_id/users", canUpdateCalendarAsAdmin, calendarsController.addNewUsers);
calendarsRouter.patch("/:calendar_id", canUpdateCalendar, calendarsController.updateCalendarData);
calendarsRouter.patch("/:calendar_id/users/:user_id", canUpdateCalendarAsAdmin, calendarsController.updateUsersRole);
calendarsRouter.delete("/:calendar_id", canUpdateCalendar, calendarsController.deleteCalendar);
calendarsRouter.delete("/:calendar_id/users", canUpdateCalendarAsAdmin, calendarsController.deleteUsers);

module.exports = calendarsRouter;

