const { Post } = require("../model/posts.model")
const { User } = require("../model/users.model")

const getAllPosts = async (req,res,next)=>{
    try {
        const {userId} = req.params
        // const posts= await User.findOne({userId}).select("-__v -created_at")
        const posts= await Post.find({}).select("-__v").populate("author","-password -__v").populate("likedUsers")

        res.status(201).json({
            posts
        })


        // const users = await User.find({}).select("-__v")
        // res.status(201).json({
        //     users
        // })
    } catch (error) {
        next(error)
    }
}

const addNewPosts = async(req,res,next) =>{
    try {
        const {userId:author} = req.params
        const {content} = req.body

        const foundUser = await User.findById(author)
        // const foundPostsArray = await Post.findOne({userId})
        const newPost = new Post({author,content,likedUsers:[]})

        foundUser.posts= newPost
        await foundUser.save()

        const updatedPost = await (await newPost.save()).populate("likedUsers")

        res.status(201).json({message:"added new post",posts:updatedPost})
        notificationForNewPost(updatedPost)

    } catch (error) {
        next(error)
    }
}

const likedPost = async(req,res,next) =>{
    try {
        
        const {userId,postId} = req.params
        // const  {postId} = req.body
        const foundUserPost = await Post.findById(postId).populate('likedUsers')
        // console.log(foundUserPost)
        foundUserPost.likedUsers.push(userId)
        await foundUserPost.save()
        const posts=await Post.findById(postId).populate('likedUsers')
        res.status(201).json({
            posts
        })
        notificationForLike(foundUserPost)

    } catch (error) {
        next(error)
    }
}
const unlikedPost = async(req,res,next) =>{
    try {
        
        const {userId,postId} = req.params
        // const  {postId} = req.body
        const foundUserPost = await Post.findById(postId).populate('likedUsers')

        foundUserPost.likedUsers.pull(userId)
        await foundUserPost.save()
        const posts=await Post.findById(postId).populate('likedUsers')
        res.status(201).json({
            posts
        })

    } catch (error) {
        next(error)
    }
}

const notificationForLike = async (post, userId) => {
    try {
      const newNotification = {
        action: "Liked",
        postId: post._id,
        originUser: userId,
        destinationUser: post.userId,
      };
      Notification.create(newNotification);
    } catch (error) {
      return new Error("Like notification failed!");
    }
  };
const notificationForNewPost = async (post, userId) => {
    try {
      const newNotification = {
        action: "Liked",
        postId: post._id,
        originUser: userId,
        destinationUser: post.userId,
      };
      Notification.create(newNotification);
    } catch (error) {
      return new Error("Like notification failed!");
    }
  };
module.exports = {
    addNewPosts,getAllPosts,likedPost,unlikedPost
}