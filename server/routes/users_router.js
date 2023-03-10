const express = require("express");
const usersController = require('../controllers/users_controllers/users_controller');
const isAuth = require("../middleware/isAuth");
const usersRouter = express.Router();

const fileUpload = require('../middleware/fileUpload');

function avatarUpload(req, res, next) {
    const upload = fileUpload.single("avatar");

    upload(req, res, function (err) {
        if (err) {
            return res.status(400)
                .json({ message: err });
        }
        next();
    });
}

usersRouter.get("/", isAuth, usersController.getAllUsers);
usersRouter.get("/:user_id", isAuth, usersController.getUserById);
usersRouter.patch("/profile", isAuth, avatarUpload, usersController.uploadUserData);
usersRouter.delete("/profile", isAuth, usersController.deleteUser);

module.exports = usersRouter;

