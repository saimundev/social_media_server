import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String,
        required:false
    },
    cover:{
        type:String,
        required:false
    },
    followers:{
        type:Array,
        default:[]
    },
    followings:{
        type:Array,
        default:[]
    },
    address:{
        type:String,
    },
    status:{
      type:String  
    },
    city:{
        type:String 
    },
    isVarefay:{
        type:Boolean,
        default:false
    }
});


const UserModel = mongoose.model("User",userSchema);

export default UserModel;