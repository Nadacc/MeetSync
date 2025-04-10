import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser';

const app=express();
app.use(express.json())

dotenv.config();
connectDB();
const corsOptions = {
    origin:process.env.CLIENT_URL,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}
app.use(cors(corsOptions))


app.use(cookieParser());
app.use('/api/users',userRoutes)


app.use(errorHandler)
const PORT =  8080;
app.listen(PORT,() => {
    console.log(`Server is running on ${PORT}`);
    
})