const ValidationError = require('../../errors/ValidationError');
const db = require("../../models/init.js");
const User = db.sequelize.models.user;

function checkPasswordConfirmation(data) {
    if (data.password !== data.passwordConfirmation) {
        throw new ValidationError("Password and password confirmation do not match", 400);
    }
}

async function validatePassword(password) {
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
        throw new ValidationError("Password must containt only a-z, A-Z, 0-9", 400);
    }
    if (!/(?=.*\d)/.test(password)) {
        throw new ValidationError("Password must containt at least one digit", 400);
    }
    if (!/(?=.*[a-z])/.test(password)) {
        throw new ValidationError("Password must containt at least one lowercase letter", 400);
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        throw new ValidationError("Password must containt at least one uppercase letter", 400);
    }
}

async function validateLogin(login) {
    if (!login) {
        throw new ValidationError("Login length must be from 2 to 50 characters", 400);
    }

    const user = await User.findOne({
        where: {
            login: login
        }
    });

    if (user) {
        throw new ValidationError("The user with this login already exists", 400);
    }

    if (login.length < 2 || login.length > 50) {
        throw new ValidationError("Login length must be from 2 to 50 characters", 400);
    }
    if (!/^[a-zA-Z0-9 ]+$/.test(login)) {
        throw new ValidationError("Login must containt only a-z, A-Z, 0-9 or whitespace", 400);
    }
}

function validateFullName(fullName) {
    if (!fullName) {
        throw new ValidationError("Full name length must be from 2 to 50 characters", 400);
    }

    if (fullName.length < 2 || fullName.length > 50) {
        throw new ValidationError("Full name length must be from 2 to 50 characters", 400);
    }
    if (!/^[a-zA-Z ]+$/.test(fullName)) {
        throw new ValidationError("Full name must containt only a-z, A-Z or whitespace", 400);
    }
}

async function validateEmail(email) {
    if (!email) {
        throw new ValidationError("Validation isEmail on email failed", 400);
    }

    const user = await User.findOne({
        where: {
            email: email
        }
    });

    if (user) {
        throw new ValidationError("The user with this email already exists", 400);
    }
    if (email.length > 200) {
        throw new ValidationError("Email length must be less than 200 characters", 400);
    }
}

function validateRole(role) {
    if (role !== 'admin' && role !== 'user') {
        throw new ValidationError("Role must be 'admin' or 'user'", 400);
    }
}

function validateName(name) {
    if (!name) {
        throw new ValidationError("Name is required", 400);
    }
    if (name.length > 200) {
        throw new ValidationError("Name length must be less than 200 characters", 400);
    }
}

function validateDescription(description) {
    if (description) {
        if (description.length > 65000) {
            throw new ValidationError("Description length must be less than 65000 characters", 400);
        }
    }
}

function validateCategory(category) {
    if (category !== 'arrangement' && category !== 'reminder' && category !== 'task') {
        throw new ValidationError("Category must be 'arrangement' or 'reminder' or 'task'", 400);
    }
}

function validateDate(dateFrom, dateTo, category) {
    dateFrom = (new Date(dateFrom)).getTime();
    dateTo = (new Date(dateTo)).getTime();

    if (dateFrom <= 0) {
        throw new ValidationError("DateFrom is invalid", 400);
    }
    if (category == 'arrangement') {
        if (dateTo <= 0) {
            throw new ValidationError("DateTo is invalid", 400);
        }
        if (dateTo - dateFrom <= 0) {
            throw new ValidationError("DateTo must be greater than dateFrom", 400);
        }
    }
}

function validateColor(color) {
    if (color) {
        if (!/^#[\da-fA-F]{6}$/.test(color)) {
            throw new ValidationError("Color must be in hexadecimal representation", 400);
        }
    }
}

module.exports = {
    checkPasswordConfirmation,
    validatePassword,
    validateLogin,
    validateFullName,
    validateEmail,
    validateRole,
    validateName,
    validateDescription,
    validateCategory,
    validateDate,
    validateColor
}

