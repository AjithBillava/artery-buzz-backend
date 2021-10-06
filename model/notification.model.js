const mongoose = require("mongoose")
const Schema = mongoose.Schema

const NotificationSchema = new Schema(
    {
        action:{
            type:String,
            required:true,
            // enum:["Liked,New Post,Followed"]
        },
        isRead:{
            type:Boolean,
            default:false
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"Post"
        },
        originUser:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        destinationUser:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }
)
const Notification = mongoose.model("Notification",NotificationSchema)
module.exports = {Notification}