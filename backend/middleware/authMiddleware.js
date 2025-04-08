import User from "../models/userModel.js";
import CustomError from "../utils/customError.js";
import { verifyToken } from "../utils/jwt.js";

const authenticate=async(req,res,next)=>{
    try{
        console.log("Cookies received:", req.cookies);
        console.log("Access token:", req.cookies.accessToken);

        const token=req.cookies.accessToken
        if(!token){
            throw new CustomError("Access token is missing",401)
        }
        const decoded=verifyToken(token,process.env.JWT_SECRET)
        if(!decoded){
            throw new CustomError("Invalid or expired refresh token",403)
        }
        const user=await User.findById(decoded.id)
        if(!user){
            throw new CustomError('User not found',404)
        }
        req.user=user
        next()
    }
    catch(error){
        next(error)
    }
}
export default authenticate