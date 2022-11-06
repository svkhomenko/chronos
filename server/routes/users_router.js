const express = require("express");
const usersController = require('../controllers/users_controllers/users_controller');
const isAuth = require("../middleware/isAuth");
const usersRouter = express.Router();

// const fileUpload = require('../middleware/fileUpload');

// function avatarUpload(req, res, next) {
//     const upload = fileUpload.single("avatar");

//     upload(req, res, function (err) {
//         if (err) {
//             return res.status(400)
//                 .json({ message: err });
//         }
//         next();
//     });
// }

// usersRouter.get("/", usersController.getAllUsers);
usersRouter.get("/:user_id", isAuth, usersController.getUserById);
// usersRouter.get("/:user_id/rating", usersController.getRatingById);
// usersRouter.post("/", isAdmin, usersController.createNewUser);
// usersRouter.patch("/avatar", isAuth, avatarUpload, usersController.uploadAvatar);
// usersRouter.patch("/:user_id", canUpdateUserData, avatarUpload, usersController.uploadUserData);
// usersRouter.delete("/:user_id", canUpdateUserData, usersController.deleteUser);

module.exports = usersRouter;

