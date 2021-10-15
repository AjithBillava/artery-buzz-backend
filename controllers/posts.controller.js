const { Post } = require("../model/posts.model")
const { User } = require("../model/users.model")

const getAllPosts = async (req,res,next)=>{
    try {
       
        
        const posts= await Post.find({}).select("-__v").populate("author","-password -__v").populate("likedUsers", "-password -__v")
        res.status(201).json({
            posts
        })


        
    } catch (error) {
        next(error)
    }
}

const addNewPosts = async(req,res,next) =>{
    try {
        const {userId:author} = req.params
        const {content} = req.body

        const foundUser = await User.findById(author)
        
        const newPost = new Post({author,content,likedUsers:[]})

        foundUser.posts.push(newPost)
        await foundUser.save()

        const updatedPost = await (await newPost.save()).populate("likedUsers", "-password -__v")

        res.status(201).json({message:"added new post",posts:updatedPost})
        notificationForNewPost(updatedPost,author)

    } catch (error) {
        next(error)
    }
}

const likedPost = async(req,res,next) =>{
    try {
        
        const {userId,postId} = req.params
        
        const foundUserPost = await Post.findById(postId).populate("likedUsers", "-password -__v")
        
        foundUserPost.likedUsers.push(userId)
        await foundUserPost.save()
        const posts= await Post.find({}).select("-__v").populate("author","-password -__v").populate("likedUsers", "-password -__v")
        res.status(201).json({
            posts
            
        })
        notificationForLike(foundUserPost._id,foundUserPost.author,userId)
        console.log(notificationForLike(foundUserPost._id,foundUserPost.author,userId))
    } catch (error) {
        next(error)
    }
}
const unlikedPost = async(req,res,next) =>{
    try {
        
        const {userId,postId} = req.params
       
        const foundUserPost =await Post.findById(postId).populate("likedUsers", "-password -__v")

        foundUserPost.likedUsers.pull(userId)
        await foundUserPost.save()
        const posts= await Post.find({}).select("-__v").populate("author","-password -__v").populate("likedUsers", "-password -__v")
        res.status(201).json({
            posts
            
        })

    } catch (error) {
        next(error)
    }
}

const notificationForLike = async (postId,author, userId) => {
    try {
        console.log(postId,author,userId)
      const newNotification = {
        action: "Liked",
        postId: postId,
        originUser: userId,
        destinationUser: author,
      };
      Notification.create(newNotification);
    } catch (error) {
      return new Error("Like notification failed!");
    }
  };
const notificationForNewPost = async (post, userId) => {
    try {
        console.log(post,userId)
        const {followers} = await User.findById(userId).populate("followers","-__v -password")

        followers.forEach(user => {
            const newNotification = {
                action: "New Post",
                postId: post._id,
                originUser: user._id,
                destinationUser: post.author._id,
              };
            Notification.create(newNotification);

        });
        
    //   const newNotification = {
    //     action: "New Post",
    //     postId: post._id,
    //     originUser: userId,
    //     destinationUser: post.author._id,
    //   };
    //   Notification.create(newNotification);
    } catch (error) {
      return new Error("Like notification failed!");
    }
  };
module.exports = {
    addNewPosts,getAllPosts,likedPost,unlikedPost
}