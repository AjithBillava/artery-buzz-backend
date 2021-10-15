

const bcryptjs = require("bcryptjs")
const emailValidator = require("email-validator")
const jwt = require("jsonwebtoken")
const lodash = require("lodash")
const {User} = require("../model/users.model")
const {Notification} = require("../model/notification.model")
const registerUser = async(req,res,next) =>{
    try {
        
        const {firstname,lastname,username,email,password,bio,profilePic,website} = req.body
        const validateEmail = emailValidator.validate(email)

        if(!firstname||!lastname||!username||!email||!password){
            return res.status(400).json({
                message:"Please fill the required fields"
            })
        }

        if(!validateEmail){
            return res.status(400).json({
                message:"Please enter valid email address"
            })
        }

        const checkUserNameExist = await User.findOne({username})
        const foundUser = await User.findOne({email})
        // const foundUser = await User.findOne({email,username})

        if(foundUser){  
            return res.status(400).json({
                message:"user already exists"
            })
        }
        if(checkUserNameExist){
            return res.status(400).json({
                message:"username is taken already"
            })
        }

        const jwtSecretKey = process.env.JWTSECRET

        const user = new User({firstname,lastname,username,email,password,bio,profilePic,website})
        bcryptjs.genSalt(10,(err,salt)=>{
            bcryptjs.hash(user.password,salt,async(err,hash)=>{
                if(err){
                    throw Error(err)
                }
                user.password=hash
                
                const updatedUser = await user.save()
                jwt.sign(
                    {id:updatedUser._id},
                    jwtSecretKey,
                    {expiresIn:"24h"},
                    (err,token)=>{
                        if(err){
                            throw Error(err)
                        }
                        updatedUser.password = undefined
                        updatedUser.__v=undefined

                        return res.status(200).json({
                            message:"user registered succefully",
                            token,
                            user:updatedUser
                        })

                    }
                )
            })
        })


    } catch (error) {
        next(error)
    }
}

const loginUser = async(req,res,next) =>{
    try {
        
        const {email,password} = req.body
        const validateEmail= emailValidator.validate(email)

        if(!email || !password){
            return res.status(400).json({
                message:"Please enter all fields"
            })
        }
        if(!validateEmail){
            return res.status(400).json({
                message:"Please enter a valid email address"
            })
        }
        const foundUser = await User.findOne({email}).select("-createdAt -updatedAt -__v")
        .populate("followers","-password -__v").populate("following","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            }
        })

        if(!foundUser){
            return res.status(404).json({
                message:"User does not exists, please register"
            })
        }

        const checkPassword = await bcryptjs.compare(password,foundUser.password)
        if(!checkPassword){
            return res.status(400).json({
                message:"Invalid password"
            })
        }

        const jwtSecretKey = process.env.JWTSECRET

        jwt.sign(
            {id:foundUser},
            jwtSecretKey,
            {expiresIn:"24h"},
            (err,token)=>{
                if(err){
                    throw Error(err)
                }
                foundUser.password=undefined
                res.status(201).json(
                    {
                        message:"logged in",
                        token,
                        user:foundUser
                    }
                )
            }
        )


    } catch (error) {
        next(error)
    }
}

const getCurrentUser = async(req,res,next) =>{
    try {
        
        const userId = req.user.id

        const foundUser  = await User.findById(userId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        // const foundUser  = await User.findById(userId).populate("following").populate("followers").populate("posts")

        res.status(201).json({
            message:"user fetched successfully",
            user:foundUser
        })

    } catch (error) {
        next(error)
    }
}

const getAllUsers = async(req,res,next) =>{
    try {
        
        const users = await User.find({}).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        res.status(201).json({
            users
        })

    } catch (error) {
        next(error)
    }
}

const getUserData = async(req,res,next) =>{
    try {
        const {requiredUserId} = req.params
        const user = await User.findById(requiredUserId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        res.status(201).json({
            user
        })
    } catch (error) {
        next(error)
    }
}

const updateUsers = async(req,res,next) => {
    try {
        
        const {userId} = req.params
        const userUpdates = req.body

        const foundUser = await User.findById(userId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        if(!foundUser){
            return res.status(404).json({
                message:"User does not exist"
            })
        }

        const updateUser = lodash.extend(foundUser,userUpdates)
        await updateUser.save()

        updateUser.password=undefined
        res.status(201).json({
            message:"user updated",
            user:updateUser
        })

    } catch (error) {
        next(error)
    }
}

const followUser = async(req,res,next) =>{
    try {
        
        const {userId} = req.params
        const {userId:followedUserId} = req.body

        let foundUser  = await User.findById(userId)
        // const foundUser = await User.findById(userId)
        let followedUser = await User.findById(followedUserId)
        
        if(!followedUser){
            return res.status(404).json({
                message:"User does not exists"
            })
        }
        // const checkAlreadyFollowing = await User.findById(userId).findOne({followedUserId})

        // if(checkAlreadyFollowing ){
        //     return res.status(401).json({message:"you are already following"})
        // }

        foundUser.following.push(followedUserId)
        followedUser.followers.push(foundUser)

        await foundUser.save()
        await followedUser.save()
        foundUser =await User.findById(userId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        

        followedUser = await User.findById(followedUserId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v")
        
        res.status(201).json({user:foundUser,followedUser})
        
        notificationForFollow(userId,followedUserId)

    } catch (error) {
        next(error)
    }
}

const unfollowUser = async(req,res,next) =>{
    try {
        
        const {userId} = req.params
        const {userId:unfollowedUserId} = req.body

        let foundUser = await User.findById(userId)
        // const foundUser = await User.findById(userId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v")
        let unfollowedUser = await User.findById(unfollowedUserId)
        if(!unfollowedUser){
            return res.status(404).json({
                message:"user does not exist"
            })
        }
        foundUser.following.pull(unfollowedUserId)
        unfollowedUser.followers.pull(foundUser)
        await foundUser.save()
        await unfollowedUser.save()
        
        foundUser= await User.findById(userId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v").
        populate({
            path:"posts",
            populate:{
                path:"author",
                select:"-__v -password",
            }
        }).
        populate({
            path:"posts",
            populate:{
                path:"likedUsers",
                select:"-__v -password",
            },
        })
        unfollowedUser= await User.findById(unfollowedUserId).select("-password -__v").populate("following","-password -__v").populate("followers","-password -__v")

        res.status(201).json({user:foundUser,unfollowedUser})


    } catch (error) {
        next(error)
    }
}

const notificationForFollow = async(userId,followedUserId) =>{
    try {
        const newNotification = {
          action: "Followed",
          originUser: userId,
          destinationUser: followedUserId,
        };
        Notification.create(newNotification);
        
      } catch (error) {
        return new Error("Follow notification failed!");
      }
}

const getUserNotification = async( req,res,next) =>{
    try {
        
        // const {userId} = req.body
        const {userId} = req.params
        const notifications = await Notification.find({destinationUser:userId}).sort("-createdAt").select("-__v")
        
        res.status(201).json({
            notifications
        })
        
    } catch (error) {
        next(error)
    }
}

const readNotification = async(req,res,next) =>{
    try {
        
        const {userId} = req.params
        const {notificationId} = req.body

        let foundUserNotification = await Notification.findById(notificationId)
        // if(foundUserNotification.destinationUser === userId){
            foundUserNotification.isRead = true
        // }

        foundUserNotification = await foundUserNotification.save()
        const notifications = await Notification.find({destinationUser:userId}).sort("-createdAt").select("-__v")
        
        res.status(201).json({
            notificatonRead:foundUserNotification,
            notifications
        })

    } catch (error) {
        next(error)
    }
}

module.exports={
    getAllUsers,
    getCurrentUser,
    getUserData,
    registerUser,
    updateUsers,
    loginUser,
    followUser,
    unfollowUser,
    getUserNotification,
    readNotification,
}