const bcrypt  = require("bcrypt");
const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendEmailForEmailConfirmation } = require('../tools/sendEmail');
const { checkPasswordConfirmation, validatePassword, validateLogin, validateFullName, validateEmail } = require('../tools/dataValidation');
const { sendError } = require('../tools/sendError');

const User = db.sequelize.models.user;

async function register(req, res) {
    const data = req.body;
    
    try {
        if (!data.link) {
            throw new ValidationError("No link for email confirmation", 400);
        }
        checkPasswordConfirmation(data);
        await validatePassword(data.password);
        await validateLogin(data.login);
        validateFullName(data.fullName);
        await validateEmail(data.email);

        let salt = bcrypt.genSaltSync(10);

        const user = await User.create({
            login: data.login,
            encrypted_password: bcrypt.hashSync(data.password, salt),
            full_name: data.fullName,
            email: data.email
        });

        await sendEmailForEmailConfirmation(data.link, data.email, data.login);

        res.setHeader("Location", `/api/users/${user.id}`)
            .status(201).send();
    }
    catch(err) {
        sendError(err, res); 
    }    
}

module.exports = register;

