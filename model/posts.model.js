const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        author:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String,
            required:"Post content cannot be empty"
        },
        likedUsers:[
            {
                type:Schema.Types.ObjectId,ref:"User"
            }
        ],
        comments:[
            {
                userId:{type:Schema.Types.ObjectId,ref:"User"},
                comment:{type:String}
            }
        ]
    }
)

const Post = mongoose.model("Post",PostSchema)
module.exports = {Post}