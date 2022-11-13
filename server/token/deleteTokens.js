const { Sequelize } = require("sequelize");
const db = require("../models/init.js");
require('dotenv').config();

const Token = db.sequelize.models.token;

function destroyTokens() {
    const { Op } = Sequelize;
    const threshold = new Date(Date.now() - process.env.EXPIRE_SEC * 1000);
    Token.destroy({
        where: {
            created_at: { 
                [Op.lt]: threshold,
            },
        }})
    .catch();
}

module.exports = function deleteTokens() {
    setTimeout(destroyTokens, process.env.EXPIRE_SEC * 1000);
}

