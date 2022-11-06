const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendEmailForPasswordConfirmation } = require('../tools/sendEmail');
const { sendError } = require('../tools/sendError');

const User = db.sequelize.models.user;

async function sendPasswordConfirmation(req, res) {
    const { link, email } = req.body;
    
    try {
        if (!link) {
            throw new ValidationError("No link for password reset confirmation", 400);
        }
        if (!email) {
            throw new ValidationError("No email for password reset confirmation", 400);
        }
        
        const user = await User.findOne({
            where: {
                email
            },
        });

        if (!user) {
            throw new ValidationError("No user with this email found", 404);
        }

        await sendEmailForPasswordConfirmation(link, email, user.login);

        res.status(200).send();
    }
    catch(err) {
        sendError(err, res);
    }
}

module.exports = sendPasswordConfirmation;

