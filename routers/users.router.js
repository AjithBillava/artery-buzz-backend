const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { getAllUsers,
    getCurrentUser,
    registerUser,
    loginUser,
    followUser,
    unfollowUser,
    notificationForFollow,
    updateUsers} = require("../controllers/users.controller")

const userRouter = express.Router();

userRouter.route("/").all(checkAuth).get(getCurrentUser)
userRouter.route("/:userId").all(checkAuth).get(getAllUsers)
userRouter.route("/:userId/follow").all(checkAuth).post(followUser)
// userRouter.route("/:userId/follow").all(checkAuth).post(followUser).post(notificationForFollow)
userRouter.route("/:userId/unfollow").all(checkAuth).post(unfollowUser)
userRouter.route("/:userId/updateUser").all(checkAuth).post(updateUsers)

userRouter.route("/login").post(loginUser)
userRouter.route("/register").post(registerUser)

module.exports = userRouter