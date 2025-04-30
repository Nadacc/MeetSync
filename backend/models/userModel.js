import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true ,lowercase:true,trim:true},
    password: { type: String }, // not required for Google users

    profilePic: { type: String },
    timezone: {
      type: String,
      default: 'Asia/Calcutta',
    },

    isGoogleUser: {
      type: Boolean,
      default: false, // false for normal signup, true for Google login
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
