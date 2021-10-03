const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = Schema(
    {
        firstName: {
            type:String,
            required:"firstname is required"
        },
        lastname:{
            type:String,
            required:"lastname is required"
        },
        email:{
            type:String,
            unique:true,
            required:"email is required"
        },
        password:{
            type:String,
            required:"password is required"
        },
        bio: {
            type:String
        },
        profielPic: {
            type:mongoose.SchemaTypes.Url
        },
        website:{
            type:mongoose.SchemaTypes.Url
        },
        followers:[
            {
                type:Schema.Types.ObjectId,ref:"User"
            },
        ],
        following:[
            {
                type:Schema.Types.ObjectId,ref:"User"
            },
        ],
        posts:[
            {
                type:Schema.Types.ObjectId,ref:"Post"
            }
        ]

    }
)


const User = mongoose.model("User",UserSchema)

module.exports = {User}