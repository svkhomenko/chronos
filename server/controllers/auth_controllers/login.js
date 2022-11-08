const bcrypt  = require("bcrypt");
const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendEmailForEmailConfirmation } = require('../tools/sendEmail');
const { signJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;

async function login(req, res) {
    const { login, password, link } = req.body;
    
    try {
        if (!login || !password) {
            throw new ValidationError("Wrong login and/or password", 400);
        }
        
        const user = await User.findOne({
            where: {
                login: login
            }
        });
        if (!user || !bcrypt.compareSync(password, user.encrypted_password)) {
            throw new ValidationError("Wrong login and/or password", 400);
        }
        
        if (user.status !== 'active') {
            if (link) {
                await sendEmailForEmailConfirmation(link, user.email, user.login);
            }
            throw new ValidationError("Your email is not confirmed. Check your email", 403);
        }
        
        res.status(200)
            .json({ 
                id: user.id,
                login: user.login,
                fullName: user.full_name,
                email: user.email,
                profilePicture: user.profile_picture,
                token: await signJWTToken({ id: user.id, login: user.login }, process.env.SECRET, { expiresIn: +process.env.EXPIRE_SEC }),
                status: user.status
            });
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = login;

