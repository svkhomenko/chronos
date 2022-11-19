const { Op } = require("sequelize");
const db = require("../../models/init.js");
const { verifyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');
require('dotenv').config();

const User = db.sequelize.models.user;

async function getAllUsers(req, res) {
    const token = req.headers.authorization;
    let { search, notUsersIds } = req.query;

    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);

        let limit = 10;

        let where = {
            status: 'active'
        };

        if (notUsersIds) {
            notUsersIds = notUsersIds.split(',');

            where = {
                ...where,
                id: {
                    [Op.notIn]: notUsersIds
                }
            }
        }
        
        if (search) {
            where = {
                ...where,
                [Op.or]: [
                    { 
                        login: {
                            [Op.substring]: search
                        }
                    },
                    { 
                        full_name: {
                            [Op.substring]: search
                        }
                    },
                    { 
                        email: {
                            [Op.substring]: search
                        }
                    }
                ] 
            };
        }

        let allUsers = await User.findAll({
            where: where,
            limit: limit
        });

        allUsers = allUsers.map(user => ({ 
                id: user.id,
                login: user.login,
                fullName: user.full_name,
                email: user.email,
                profilePicture: user.profile_picture,
                status: user.status
            })
        );
        
        res.status(200)
            .json(allUsers);
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = getAllUsers;

