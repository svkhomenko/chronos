const { DataTypes } = require("sequelize");

module.exports = function initUserEvent(sequelize) {
    sequelize.define("user_event", 
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
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: "Event",
                key: "id"
            }
        },
    },
    { 
        timestamps: false
    });
}

