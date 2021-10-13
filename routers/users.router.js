const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { getAllUsers,
    getCurrentUser,
    registerUser,
    loginUser,
    followUser,
    unfollowUser,
    getUserNotification,
    updateUsers,
    getUserData} = require("../controllers/users.controller")

const userRouter = express.Router();

userRouter.route("/").all(checkAuth).get(getCurrentUser)

userRouter.route("/login").post(loginUser)
userRouter.route("/register").post(registerUser)

userRouter.route("/:userId").all(checkAuth).get(getAllUsers)
userRouter.route("/:userId/userProfile/:requiredUserId").all(checkAuth).get(getUserData)
userRouter.route("/:userId/follow").all(checkAuth).post(followUser)
userRouter.route("/:userId/notifications").all(checkAuth).get(getUserNotification)
// userRouter.route("/:userId/follow").all(checkAuth).post(followUser).post(notificationForFollow)
userRouter.route("/:userId/unfollow").all(checkAuth).post(unfollowUser)
userRouter.route("/:userId/updateUser").all(checkAuth).post(updateUsers)


module.exports = userRouter