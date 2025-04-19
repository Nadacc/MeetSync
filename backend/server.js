
import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';

import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser';
import meetingRoutes from './routes/meetingRoutes.js'
import availabilityRoutes from './routes/availabilityRoutes.js'

const app=express();
app.use(express.json())


console.log('✅ ENV TEST:', process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

connectDB();
const corsOptions = {
    origin:process.env.CLIENT_URL,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    credentials:true
}
app.use(cors(corsOptions))


app.use(cookieParser());
app.use('/api/users',userRoutes)
app.use('/api/meetings',meetingRoutes)
app.use('/api/availability',availabilityRoutes)


app.use(errorHandler)
const PORT =  8080;
app.listen(PORT,() => {
    console.log(`Server is running on ${PORT}`);
    
})