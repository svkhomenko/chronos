const db = require("../../models/init.js");
const { verifyJWTToken, destroyJWTToken } = require('../../token/tokenTools');
require('dotenv').config();

const User = db.sequelize.models.user;
const Calendar = db.sequelize.models.calendar;
const UserCalendar = db.sequelize.models.user_calendar;

async function confirmEmail(req, res) {
    const confirmToken = req.params.confirm_token;

    try {
        const decoded = await verifyJWTToken(confirmToken, process.env.SECRET_EMAIL);
        if (!decoded.email) {
            throw new Error('');
        }
        
        let user = await User.findOne({
            where: {
                email: decoded.email
            },
        });
        if (!user) {
            throw new Error('');
        }
        
        user.set({
            status: "active"
        });
        user = await user.save();

        await destroyJWTToken(confirmToken);

        createMainCalendar(user.id);
        
        res.setHeader("Location", `/api/users/${user.id}`)
            .status(201).send();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

async function createMainCalendar(userId) {
    const userCalendar = await UserCalendar.findOne({
        where: {
            user_id: userId
        }
    });

    if (!userCalendar) {
        const calendar = await Calendar.create({
            name: "Main calendar",
            description: "It is your main calendar. Create more if you need",
            status: "main"
        });
    
        await UserCalendar.create({
            user_id: userId,
            calendar_id: calendar.id,
            user_role: "admin"
        });
    }
}

module.exports = confirmEmail;

