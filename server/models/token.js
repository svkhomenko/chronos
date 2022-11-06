const { Sequelize, DataTypes } = require("sequelize");

module.exports = function initToken(sequelize) {
    sequelize.define("token", {
        token: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        created_at: {
            type: "TIMESTAMP",
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        }
    },
    { 
        timestamps: false
    });
}

