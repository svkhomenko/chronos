const bcrypt  = require("bcrypt");
const { verifyJWTToken, destroyJWTToken } = require('../../token/tokenTools');
const ValidationError = require('../../errors/ValidationError');
const { validatePassword } = require('../tools/dataValidation');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const db = require("../../models/init.js");
const User = db.sequelize.models.user;

async function confirmPassword(req, res) {
    const confirmToken = req.params.confirm_token;
    const { newPassword } = req.body;
    
    try {
        const decoded = await verifyJWTToken(confirmToken, process.env.SECRET_PASSWORD);
        if (!decoded.email) {
            throw new ValidationError("Invalid token", 401);
        }

        await validatePassword(newPassword);

        let user = await User.findOne({
            where: {
                email: decoded.email
            },
        });
        if (!user) {
            throw new ValidationError("Invalid token", 401);
        }
        
        let salt = bcrypt.genSaltSync(10);
        user.set({
            encrypted_password: bcrypt.hashSync(newPassword, salt)
        });
        user = await user.save();

        await destroyJWTToken(confirmToken);
        
        res.setHeader("Location", `/api/users/${user.id}`)
            .status(201).send();
    } catch (err) {
        sendError(err, res);
    }
}

module.exports = confirmPassword;

