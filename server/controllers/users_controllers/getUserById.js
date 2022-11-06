const db = require("../../models/init.js");
const ValidationError = require('../../errors/ValidationError');
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;

async function getUserById(req, res) {
    const token = req.headers.authorization;
    const id = req.params.user_id;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);
        const curUser = await User.findByPk(decoded.id);
        if (!curUser) {
            throw new ValidationError("Invalid token", 401);
        }
        
        let user = await User.findByPk(id);
        if (!user) {
            throw new ValidationError("No user with this id", 404);
        }

        if (user.status === "pending") {
            throw new ValidationError("Forbidden data", 403); 
        }
        
        res.status(200)
            .json({ 
                id: user.id,
                login: user.login,
                fullName: user.full_name,
                email: user.email,
                profilePicture: user.profile_picture,
                status: user.status
            });
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = getUserById;

