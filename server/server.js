const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const cors = require('cors');
app.use(cors({
    origin: '*',
    exposedHeaders: "Location"
}));

app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./token/deleteTokens')();

const authRouter = require("./routes/auth_router.js");
const usersRouter = require("./routes/users_router.js");
const calendarsRouter = require("./routes/calendars_router.js");
const eventsRouter = require("./routes/events_router.js");

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/calendars", calendarsRouter);
app.use("/api/events", eventsRouter);
 
app.use(function (req, res) {
    res.status(404)
    .json({
        message: "Not Found"
    });
});
app.listen(3000, () => {
    console.log(`Server is running at port 3000`);
});

