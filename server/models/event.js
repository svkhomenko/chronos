const { Sequelize, DataTypes } = require("sequelize");

module.exports = function initEvent(sequelize) {
    sequelize.define("event", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: { 
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.ENUM("arrangement", "reminder", "task"),
            allowNull: false
        },
        date_from: {
            type: "TIMESTAMP",
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        },
        date_to: {
            type: "TIMESTAMP",
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            allowNull: false
        },
        color: { 
            type: DataTypes.STRING(7)
        }
    },
    {
        timestamps: false
    });
}

