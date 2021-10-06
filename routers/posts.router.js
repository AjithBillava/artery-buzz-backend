const express = require("express")
const { getAllPosts, addNewPosts, unlikedPost, likedPost } = require("../controllers/posts.controller")
const checkAuth = require("../middlewares/checkAuth")

const postRouter = express.Router()

postRouter.route("/feed").get(getAllPosts)
postRouter.route("/:userId/newPost").all(checkAuth).post(addNewPosts)
postRouter.route("/:userId/:postId/likeUnlikePost").all(checkAuth).post(likedPost).put(unlikedPost)

module.exports = postRouter