import mongoose from "mongoose";

const userModel = mongoose.Schema({
    name: { type: String, required: true ,unique:true},
    email: { type: String, required: true,unique:true},
    password: { type: String, required: true },
    timezone: {
        type: String,
        default: 'Asia/Kolkata', 
      },
    
    
},{timestamps:true})

const User = mongoose.model("User",userModel)
export default User;