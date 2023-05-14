import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    post:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    cloudinary_id:{
        type:String
    },
    likes:{
        type:Array,
        default:[]
    },
    comments:[
        {
            comment:String,
            createdAt:Date,
            commentBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
           
        }
    ]
 
},{timestamps:true})

const PostModel = mongoose.model("Post",postSchema);

export default PostModel;