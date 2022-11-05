const { DataTypes } = require("sequelize");

module.exports = function initCalendar(sequelize) {
    sequelize.define("calendar", {
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
        arrangement_color: { 
            type: DataTypes.STRING(6),
            defaultValue: "ffffff",
            allowNull: false
        },
        reminder_color: { 
            type: DataTypes.STRING(6),
            defaultValue: "ffffff",
            allowNull: false
        },
        task_color: { 
            type: DataTypes.STRING(6),
            defaultValue: "ffffff",
            allowNull: false
        }
    },
    {
        timestamps: false
    });
}
