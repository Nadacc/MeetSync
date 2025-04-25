import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_URL, {
  withCredentials: true,
  transports: ["websocket"], 
});


socket.on("connect", () => {
  console.log("🔌 Connected to socket server with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected from socket server:", reason);
});


socket.on('receive_notification', (notification) => {
  // Check if the notification is related to meetings
  if (notification.title.includes('Meeting') || 
      notification.message.includes('meeting')) {
    // Trigger a Redux action to refresh meetings
    if (window.store) {
      window.store.dispatch({ type: 'meeting/refreshNeeded' });
    }
  }
});
export default socket;
