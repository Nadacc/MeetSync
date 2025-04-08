import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};
export default connectDB;

