import { compare, genSalt, hash } from "bcryptjs"
import { validate } from "email-validator"
import { sign } from "jsonwebtoken"
import { extend } from "lodash"
import { User } from "../model/users.model"

const registerUser = async(req,res,next) =>{
    try {
        
        const {firstname,lastname,email,password,bio,profilePic,website} = req.body
        const validateEmail = validate(email)

        if(!firstname||!lastname||!email||!password||!bio||!profilePic||!website){
            return res.status(400).json({
                message:"Please fill all fields"
            })
        }

        if(!validateEmail){
            return res.status(400).json({
                message:"Please enter valid email address"
            })
        }

        const foundUser = await User.findOne({email})

        if(foundUser){
            return res.status(400).json({
                message:"user already exists"
            })
        }

        const jwtSecretKey = process.env.JWTSECRET

        const user = new User({firstname,lastname,email,password,bio,profilePic,website})
        genSalt(10,(err,salt)=>{
            hash(user.password,salt,async(err,hash)=>{
                if(err){
                    throw Error(err)
                }
                user.password=hash
                
                const updatedUser = await user.save()
                sign(
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
        const validateEmail= validate(email)

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
        .populate("followers").populate("following").populate("posts")

        if(!foundUser){
            return res.status(404).json({
                message:"User does not exists, please register"
            })
        }

        const checkPassword = await compare(password,foundUser.password)
        if(!checkPassword){
            return res.status(400).json({
                message:"Invalid password"
            })
        }

        const jwtSecretKey = process.env.JWTSECRET

        sign(
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
                        foundUser
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
        
        const {userId} = req.body

        const foundUser  = await User.findById(userId).populate("following").populate("followers").populate("posts")

        res.status(201).json({
            message:"user fetched successfully",
            user:foundUser
        })

    } catch (error) {
        next(error)
    }
}

const getAllUsers = (req,res,next) =>{
    try {
        
        const users = await User.find({}).select("-__v")
        res.status(401).json({
            users
        })

    } catch (error) {
        next(error)
    }
}

const updateUsers = (req,res,next) =>{
    try {
        
        const {userId} = req.params
        const userUpdates = req.body

        const foundUser = await User.findById(userId).populate("followers").populate("following").populate("posts")

        if(!foundUser){
            return res.status(404).json({
                message:"User does not exist"
            })
        }

        const updateUser = extend(foundUser,userUpdates)
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

        const foundUser = await User.findById(userId)
        const followedUser = await User.findById(userId)
        
        if(!followedUser){
            return res.status(404).json({
                message:"User does not exists"
            })
        }

        foundUser.following.push(followedUserId)
        followedUser.followers.push(foundUser)

        await foundUser.save()
        await followedUser.save()

        const user = foundUser.populate("following").populate("followers")

        res.status(201).json({followedUser,user})


    } catch (error) {
        next(error)
    }
}

const unfollowUser = async(req,res,next) =>{
    try {
        
        const {userId} = req.params
        const {unfollowedUserId} = req.body

        const foundUser = await User.findById(userId)
        const unfollowedUser = await User.findById(unfollowedUserId)
        if(!unfollowedUser){
            return res.status(404).json({
                message:"user does not exist"
            })
        }
        foundUser.following.pull(unfollowedUserId)
        unfollowedUser.followers.pull(foundUser)

        await foundUser.save()
        await unfollowedUser.save()

        const user = foundUser.populate("following").populate("followers")

        res.status(201).json({unfollowedUser,user})


    } catch (error) {
        next(error)
    }
}

const notificationForFollow = async(req,res,next) =>{
    try {
        
        const {userId} = req.params
        const {user:followersUserId} = req.body

        const newNotification = new Notification({action:"followed",originUser:userId,destinationUser:followersUserId})
        await newNotification.save()

        return res.status(200).json({
            notification:newNotification
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllUsers,
    getCurrentUser,
    registerUser,
    loginUser,
    followUser,
    unfollowUser,
    notificationForFollow
}