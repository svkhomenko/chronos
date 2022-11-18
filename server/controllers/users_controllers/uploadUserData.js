const { Op } = require("sequelize");
const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { sendEmailForEmailConfirmation } = require('../tools/sendEmail');
const { validateFullName } = require('../tools/dataValidation');
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;

async function validateNewLogin(login, id) {
    if (login) {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.ne]: id
                },
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
}

async function validateNewEmail(email, id) {
    if (email) {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.ne]: id
                },
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
}

async function uploadUserData(req, res) {
    const token = req.headers.authorization;
    const {link, login, fullName, email, deleteAvatar } = req.body;
    
    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);
        let curUser = await User.findByPk(decoded.id);
        if (!curUser) {
            throw new ValidationError("Invalid token", 401);
        }

        if (email && !link) {
            throw new ValidationError("No link for email confirmation", 400);
        }
        await validateNewLogin(login, decoded.id);
        if (fullName) {
            validateFullName(fullName);
        }
        await validateNewEmail(email, decoded.id);

        if (email) {
            curUser.set({
                email
            });

            curUser = await curUser.save();

            await sendEmailForEmailConfirmation(link, curUser.email, curUser.login);
        }

        if (login) {
            curUser.set({
                login
            });
        }

        if (fullName) {
            curUser.set({
                full_name: fullName
            });
        }

        if (req.file && req.file.filename) {
            curUser.set({
                picture_path: req.file.filename
            });
        }
        else if (deleteAvatar) {
            curUser.set({
                picture_path: null
            });
        }

        curUser = await curUser.save();

        res.status(200)
            .json({ 
                id: curUser.id,
                login: curUser.login,
                fullName: curUser.full_name,
                email: curUser.email,
                profilePicture: curUser.profile_picture,
                status: curUser.status
            });
    }
    catch(err) {
        sendError(err, res);
    }   
}

module.exports = uploadUserData;

