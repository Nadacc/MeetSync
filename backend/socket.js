import { Server } from "socket.io";
import Notification from "./models/NotificationModel.js";

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer, clientURL) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientURL,
      credentials: true,
    },
    transports: ["websocket"], 
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);
    
    // Add this line to log all events
    socket.onAny((event, ...args) => {
      console.log(`📥 Event received: ${event}`, JSON.stringify(args, null, 2));
    });
      
    // Step 1: Register socket with userId
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`🟢 Registered User ${userId} with socket ${socket.id}`);
      console.log("Current online users:", Array.from(onlineUsers.entries()));
    });

    // Step 2: Receive notification
    socket.on("send_notification", async ({ receiverId, notification }) => {
      try {
        console.log("💌 Received notification request:", { receiverId, notification });
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log(`📨 Preparing to send to ${receiverId} | socket: ${receiverSocketId}`);
        console.log("🔍 Current online users:", Array.from(onlineUsers.entries()));

        // Save in DB
        const savedNotification = await Notification.create({
          user: receiverId,
          title: notification.title,
          message: notification.message,
          meetingId:notification.meetingId,
          isRead: false,
        });
        console.log("💾 Saved notification to DB:", savedNotification);

        // Emit to the receiver
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_notification", savedNotification);
          console.log(`✅ Sent real-time notification to ${receiverId}`);
        } else {
          console.warn(`⚠️ No socket found for user ${receiverId}. User might be offline.`);
        }
      } catch (err) {
        console.error("❌ Error sending notification:", err);
        console.error("Error details:", err.stack);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });


    // Step 3: Handle disconnect
    socket.on("disconnect", (reason) => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`🔌 Disconnected User ${userId} and removed socket ${socket.id}`);
          console.log("Remaining online users:", Array.from(onlineUsers.entries()));
          break;
        }
      }
    });
  });

  return io;
};