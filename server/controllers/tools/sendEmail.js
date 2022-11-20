const nodemailer = require('nodemailer');
const { signJWTToken } = require('../../token/tokenTools');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: 'gmail',
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL
    }
});

function sendEmail(email, subject, text, html) {
    transporter.sendMail({
        from: '"Chronos" <ucodeskhomenko@gmail.com>',
        to: email,
        subject: subject,
        text: text,
        html: html
    },
    err => {
        if (err) {
            console.log(err);
        }
    });    
}

async function sendEmailForEmailConfirmation(link, email, login) {
    if (link[link.length - 1] !== '/') {
        link += '/';
    }
    link += (await signJWTToken({ email }, process.env.SECRET_EMAIL, { expiresIn: +process.env.EXPIRE_SEC })).replaceAll('.', 'dot');

    const subject = 'Confirm your email in Chronos';
    const text = `Hi ${login}! Click the link to comfirm your email in Chronos. The link will be active for 2 hours`;
    const html = `Hi ${login}!<br>Click <a href="${link}">the link</a> to comfirm your email in Chronos. The link will be active for 2 hours`;

    sendEmail(email, subject, text, html);
}

async function sendEmailForPasswordConfirmation(link, email, login) {
    if (link[link.length - 1] !== '/') {
        link += '/';
    }
    link += (await signJWTToken({ email, password: "password" }, process.env.SECRET_PASSWORD, { expiresIn: +process.env.EXPIRE_SEC })).replaceAll('.', 'dot');

    const subject = 'Confirm your password reset in Chronos';
    const text = `Hi ${login}! Click the link to comfirm your password reset in Chronos. The link will be active for 2 hours`;
    const html = `Hi ${login}!<br>Click <a href="${link}">the link</a> to comfirm your password reset in Chronos. The link will be active for 2 hours`;

    sendEmail(email, subject, text, html);
}

async function sendEmailForReminder(email, login, event) {
    let date = new Date(event.date_from);
    date = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

    const subject = 'Reminder from Chronos';
    const text = `Hi ${login}! You scheduled an event ${event.name} for ${date}`;
    const html = `Hi ${login}!<br>You scheduled an event <b>${event.name}</b> for <b>${date}</b>`;

    sendEmail(email, subject, text, html);
}

async function sendEmailForInvite(email, login, inviter, calendar) {
    const subject = 'Invite from Chronos';
    const text = `Hi ${login}! ${inviter} invite you to ${calendar} calendar in Chronos`;
    const html = `Hi ${login}!<br><b>${inviter}</b> invite you to <b>${calendar}</b> calendar in Chronos`;

    sendEmail(email, subject, text, html);
}

module.exports = {
    sendEmail,
    sendEmailForEmailConfirmation,
    sendEmailForPasswordConfirmation,
    sendEmailForReminder,
    sendEmailForInvite
};

