const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            required:"Post content cannot be empty"
        },
        likedUsers:[
            {
                type:String,
                ref:"User"
            }
        ],
    }
)

const Post = mongoose.model("Post",PostSchema)
module.exports = {Post}