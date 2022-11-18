const { DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs");

module.exports = function initUser(sequelize) {
    sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        encrypted_password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        full_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        profile_picture: {
            type: DataTypes.VIRTUAL,
            get() {
                let fileName = this.getDataValue("picture_path");

                if (fileName) {
                    const filePath = path.resolve("uploads", fileName);
                    let file;
                    try {
                        file = fs.readFileSync(filePath);
                    }
                    catch(error) {
                        return null;
                    }

                    return file;
                }
                return null;
            }
        },
        picture_path: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM("pending", "active"),
            allowNull: false,
            defaultValue: "pending"
        }
    },
    {
        timestamps: false,
        hooks: {
            beforeUpdate: async function (instance) {
                if (instance.email !== instance._previousDataValues.email) {
                    instance.status = "pending";
                }
                
                let prevPath = instance._previousDataValues.picture_path;
                if (instance._changed.has("picture_path") && prevPath) {
                    const pictureFilePath = path.resolve("uploads", prevPath);
                    if (fs.existsSync(pictureFilePath)) {
                        await fs.promises.unlink(pictureFilePath);
                    }
                }
            },
            beforeDestroy: async function (instance) {
                if (instance.picture_path) {
                    const pictureFilePath = path.resolve("uploads", instance.picture_path);
                    if (fs.existsSync(pictureFilePath)) {
                        await fs.promises.unlink(pictureFilePath);
                    }
                }
            }
        }
    });
}

