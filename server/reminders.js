const { Sequelize } = require("sequelize");
const db = require("./models/init.js");
const { sendEmailForReminder } = require("./controllers/tools/sendEmail");

const User = db.sequelize.models.user;
const Calendar = db.sequelize.models.calendar;
const Event = db.sequelize.models.event;

module.exports = function sendReminders() {
    setTimeout(() => {
        const { Op } = Sequelize;
        const from = new Date(Date.now() + 60 * 60 * 1000);
        const to = new Date(Date.now() + 75 * 60 * 1000);

        Event.findAll({
            where: {
                category: 'reminder',
                [Op.and]: [
                    { 
                        date_from: {
                            [Op.gt]: from
                        }
                    }, 
                    { 
                        date_from: {
                            [Op.lte]: to
                        }
                    }
                ]
            },
            include: [
                {
                    model: Calendar,
                    include: [
                        {
                            model: User,
                        }
                    ]
                }
            ]
        })
        .then(events => {
            events.forEach(event => {
                event.calendar.users.forEach(user => {
                    sendEmailForReminder(user.email, user.login, event); 
                });
            });
        })
        .catch(err => {
            console.log(err);
        });     
    }, 15 * 60 * 1000);
}

