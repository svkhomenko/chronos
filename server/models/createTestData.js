const bcrypt  = require("bcrypt");
let salt = bcrypt.genSaltSync(10);

async function createTestData(sequelize) {
    const User = sequelize.models.user;
    const Calendar = sequelize.models.calendar;
    const UserCalendar = sequelize.models.user_calendar;
    const Event = sequelize.models.event;

    const user1 = await User.create({
        login: 'skhomenko',
        encrypted_password: bcrypt.hashSync('Password1', salt),
        full_name: 'Svetlana Khomenko',
        email: 'user1@gmail.com',
        status: 'active'
    });

    const user2 = await User.create({
        login: 'Mary',
        encrypted_password: bcrypt.hashSync('Password2', salt),
        full_name: 'Mary Bryan',
        email: 'user2@gmail.com',
        picture_path: 'avatar1.png',
        status: 'active'
    });

    const user3 = await User.create({
        login: 'Paul',
        encrypted_password: bcrypt.hashSync('Password3', salt),
        full_name: 'Paul Hunt',
        email: 'user3@gmail.com',
        status: 'active'
    });

    const mainCalendar1 = await Calendar.create({
        name: 'Main calendar',
        description: 'It is your main calendar. Create more if you need',
        status: 'main'
    });

    const mainCalendar2 = await Calendar.create({
        name: 'Main calendar',
        description: 'It is your main calendar. Create more if you need',
        status: 'main'
    });

    const mainCalendar3 = await Calendar.create({
        name: 'Main calendar',
        description: 'It is your main calendar. Create more if you need',
        status: 'main'
    });

    const chronosCalendar = await Calendar.create({
        name: 'Chronos calendar',
        description: 'Organization of work on chronos',
        arrangement_color: '#3f51b5',
        reminder_color: '#4285f4',
        task_color: '#039be5',
        status: 'additional'
    });

    const mathCalendar = await Calendar.create({
        name: 'Math',
        description: 'Lectures on mathematics for CS-220b group',
        status: 'additional'
    });

    await UserCalendar.bulkCreate([
        { user_id: user1.id, calendar_id: mainCalendar1.id, user_role: 'admin' },
        { user_id: user2.id, calendar_id: mainCalendar2.id, user_role: 'admin' },
        { user_id: user3.id, calendar_id: mainCalendar3.id, user_role: 'admin' },
        { user_id: user1.id, calendar_id: chronosCalendar.id, user_role: 'admin' },
        { user_id: user2.id, calendar_id: chronosCalendar.id, user_role: 'user' },
        { user_id: user3.id, calendar_id: mathCalendar.id, user_role: 'admin' },
        { user_id: user1.id, calendar_id: mathCalendar.id, user_role: 'user' },
        { user_id: user2.id, calendar_id: mathCalendar.id, user_role: 'user' },
    ]);
    
    await Event.bulkCreate([
        {
            name: 'Chronos presentation',
            category: 'arrangement',
            date_from: new Date(2022, 11, 1, 14, 00),
            date_to: new Date(2022, 11, 1, 18, 00),
            calendar_id: chronosCalendar.id
        },
        {
            name: 'Assessment',
            description: 'Start assessment',
            category: 'reminder',
            date_from: new Date(2022, 10, 28, 12, 30),
            date_to: new Date(2022, 10, 28, 12, 40),
            calendar_id: chronosCalendar.id
        },
        {
            name: 'Make video',
            description: 'Make a video of the program',
            category: 'task',
            date_from: new Date(2022, 10, 29, 9, 20),
            date_to: new Date(2022, 10, 29, 9, 30),
            completed: 1,
            calendar_id: chronosCalendar.id
        },
        {
            name: 'Finish presentation',
            category: 'task',
            date_from: new Date(2022, 10, 30, 0, 00),
            date_to: new Date(2022, 10, 30, 23, 59, 59),
            completed: 1,
            calendar_id: chronosCalendar.id
        },
        {
            name: 'Parcel',
            description: 'Pick up a parcel №0010780309843 from the post office',
            category: 'reminder',
            date_from: new Date(2022, 10, 28, 10, 00),
            date_to: new Date(2022, 10, 28, 10, 10),
            calendar_id: mainCalendar1.id,
        },
        {
            name: 'Buy cat food',
            category: 'task',
            date_from: new Date(2022, 11, 3, 11, 00),
            date_to: new Date(2022, 11, 3, 11, 00),
            calendar_id: mainCalendar1.id,
        },
        {
            name: 'Exam',
            description: 'Math exam for CS-220b group',
            category: 'arrangement',
            date_from: new Date(2022, 11, 2, 9, 00),
            date_to: new Date(2022, 11, 2, 12, 00),
            calendar_id: mathCalendar.id,
        }
    ]);
}

module.exports = createTestData;

