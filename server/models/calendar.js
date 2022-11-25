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
            type: DataTypes.STRING(7),
            defaultValue: "#0b8043",
            allowNull: false
        },
        reminder_color: { 
            type: DataTypes.STRING(7),
            defaultValue: "#009688",
            allowNull: false
        },
        task_color: { 
            type: DataTypes.STRING(7),
            defaultValue: "#33b679",
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("main", "additional"),
            allowNull: false,
            defaultValue: "additional"
        }
    },
    {
        timestamps: false
    });
}

