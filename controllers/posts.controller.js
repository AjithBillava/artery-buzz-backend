const { Post } = require("../model/posts.model")
const { User } = require("../model/users.model")

const getAllPosts = async (req,res,next)=>{
    try {
        const {userId} = req.params
        const posts= await User.findOne({userId}).select("-__v -created_at")

        res.status(200).json({
            posts
        })
    } catch (error) {
        next(error)
    }
}

const addNewPosts = async(req,res,next) =>{
    try {
        const {userId} = req.params
        const {content} = req.body

        const foundUser = new User.findById(userId)
        const foundPostsArray = new Post.findOne({userId})

        if(foundPostsArray){
            foundPostsArray.push({content,likedUsers:[]})
            const newPostsArray = await (await foundPostsArray.save()).populate("likedUsers").execPopulate()

            return res.status(201).json({message:"added new post",posts:newPostsArray})
        }
        const newPost = new Post({userId,content,likedUsers:[]})

        foundUser.posts= newPost
        await foundUser.save()

        const updatedPost = await (await newPost.save()).populate("likedUsers").execPopulate();

        res.status(201).json({message:"added new post",posts:updatedPost})

    } catch (error) {
        next(error)
    }
}

module.exports = {
    addNewPosts,getAllPosts
}