const { Sequelize } = require("sequelize");
const mysql = require('mysql2/promise');
require('dotenv').config();

const initUser = require("./user");
const initCalendar = require("./calendar");
const initUserCalendar = require("./userCalendar");
const initEvent = require("./event");
const initUserEvent = require("./userEvent");
const initToken = require('./token');

(async () => {
    const connection = await mysql.createConnection({ 
        host: process.env.HOST, 
        port: process.env.PORT, 
        user: process.env.USER_DB,
        password: process.env.PASSWORD_DB
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE}\`;`);
})();

const sequelize = new Sequelize( 
    process.env.DATABASE,
    process.env.USER_DB,
    process.env.PASSWORD_DB,
    {
        dialect: process.env.DIALECT,
        logging: false
    },
);

initUser(sequelize);
initCalendar(sequelize);
initUserCalendar(sequelize);
initEvent(sequelize);
initUserEvent(sequelize);
initToken(sequelize);

const User = sequelize.models.user;
const Calendar = sequelize.models.calendar;
const UserCalendar = sequelize.models.user_calendar;
const Event = sequelize.models.event;
const UserEvent = sequelize.models.user_event;

User.belongsToMany(Calendar, {
    through: UserCalendar,
    foreignKey: 'user_id',
    otherKey: 'calendar_id',
    hooks: true
});
Calendar.belongsToMany(User, { 
    through: UserCalendar,
    foreignKey: 'calendar_id',
    otherKey: 'user_id',
    hooks: true
});

User.belongsToMany(Event, { 
    through: UserEvent,
    foreignKey: 'user_id',
    otherKey: 'event_id',
    hooks: true
});
Event.belongsToMany(User, { 
    through: UserEvent,
    foreignKey: 'event_id',
    otherKey: 'user_id',
    hooks: true
});

const CalendarEventSettings = {
    foreignKey: {
        name: 'calendar_id',
        allowNull: false
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
};
Calendar.hasMany(Event, CalendarEventSettings);
Event.belongsTo(Calendar, CalendarEventSettings);

// Recreating the database and filling it with test data

// sequelize.sync({ force: true })
// .then(() => {
//     require('./createTestData')(sequelize);
// });

// Uncomment this and comment out the sync above if you don't want to recreate the database
sequelize.sync();

// sequelize.sync({ alter: true });

const db = {
    sequelize: sequelize
};

module.exports = db;

