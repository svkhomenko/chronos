const { DataTypes } = require("sequelize");

module.exports = function initUserCalendar(sequelize) {
    sequelize.define("user_calendar", 
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "User",
                key: "id"
            }
        },
        calendar_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "Calendar",
                key: "id"
            }
        },
        user_role: {
            type: DataTypes.ENUM("admin", "user"),
            allowNull: false,
            defaultValue: "user"
        }
    },
    { 
        timestamps: false
    });
}

