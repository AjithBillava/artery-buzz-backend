const mongoose = require("mongoose")
const Schema = mongoose.Schema

const NotificationSchema = Schema(
    {
        action:{
            type:String,
            required:true,
            enum:["liked,new post,followed,unfollowed"]
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