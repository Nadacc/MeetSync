
import dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import http from 'http'

import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser';
import meetingRoutes from './routes/meetingRoutes.js'
import availabilityRoutes from './routes/availabilityRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import { initSocket } from './socket.js';
import streamRoutes from './routes/streamRoutes.js'
import emailRoutes from './routes/emailRoute.js'

const app=express();
const server = http.createServer(app)
app.use(express.json())


//console.log('ENV TEST:', process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

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
app.use('/api/notifications',notificationRoutes)
app.use('/api/stream',streamRoutes)
app.use('/api/email',emailRoutes)


app.use(errorHandler)

initSocket(server, process.env.CLIENT_URL);
const PORT =  8080;
server.listen(PORT,() => {
    console.log(`Server is running on ${PORT}`);
    console.log(`📱 Socket.io server initialized`);
})