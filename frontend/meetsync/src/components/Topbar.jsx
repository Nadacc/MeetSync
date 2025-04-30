import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { LogOut, User, Bell } from "lucide-react"; 
import { logoutUser } from "../features/authSlice";
import { addNotification, markNotificationAsRead, fetchNotifications } from "../features/notificationSlice";

import meetlogo from '../assets/meetlogo.png'
import socket from "../socket";

import MeetingModal from "./MeetingModal";
import { fetchMeetingById } from "../features/meetingSlice";

socket.on("connect", () => {
  console.log("Frontend socket connected:", socket.id);
});

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const [selectedMeeting,setSelectedMeeting] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleNewNotification = (notification) => {
      dispatch(fetchNotifications()); 
    };
  
    if (isAuthenticated) {
      socket.on("receive_notification", handleNewNotification);
    }
  
    return () => {
      socket.off("receive_notification", handleNewNotification);
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.emit("register", user._id);
      console.log("Registering socket for user:", user._id);
    }
  }, [isAuthenticated, user?._id]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

 
const handleNotificationClick = async (notificationId) => {
  console.log("Notification clicked:", notificationId); 
  if (!notificationId) return;
  await dispatch(markNotificationAsRead(notificationId));
  const notification = notifications.find(n => n._id === notificationId);
  console.log("Notification object:", notification); 
  if (notification && notification.meetingId) {
    try {
      const action = await dispatch(fetchMeetingById(notification.meetingId));
      console.log("Fetch meeting action:", action);
      if (action.payload) {
        setSelectedMeeting(action.payload);
        setShowMeetingModal(true);
        console.log("Modal should open now");
      }
    } catch (err) {
      console.error("Failed to fetch meeting details:", err);
    }
  }
};


  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  function formatNotificationTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeString}`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-between px-6 py-4 bg-white shadow-lg items-center gap-4 border-b border-gray-200">
      
      <div className="flex items-center gap-2">
        <img
          src={meetlogo} 
          alt="Logo"
          className="w-12 h-12" 
        />
        <span className="text-xl font-semibold" style={{ fontFamily: "Dancing Script, cursive" }}>
          MeetSync
        </span>
      </div>

      {isAuthenticated && (
        <div className="relative flex items-center gap-3">
          <DropdownMenu
            onOpenChange={(isOpen) => {
              if (isOpen && unreadNotifications > 0) {
                dispatch(markNotificationAsRead());
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <Bell className="w-6 h-6 text-gray-800" />
                {unreadNotifications > 0 && (
                  <div className={`absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center 
                    ${unreadNotifications > 0 ? 'notification-badge' : ''}`}>
                    {unreadNotifications}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map((notification, index) => (
                  <DropdownMenuItem
                    key={notification._id || index}
                    className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''} 
                      ${index === 0 ? 'border-t' : ''} ${index === notifications.length - 1 ? 'border-b' : 'border-b'}`}
                    onClick={() => handleNotificationClick(notification._id)}
                  >
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatNotificationTimestamp(notification.timestamp)}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>

          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer flex items-center gap-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    {user?.name?.[0] || user?.email?.[0] || "U"}
                  </div>
                )}
                <span>{user?.name || user?.email || "User"}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/app/profile")}>
                <User className="w-4 h-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {showMeetingModal && selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          onClose={() => setShowMeetingModal(false)}
          isMyMeeting={selectedMeeting.organizer?._id === user?._id}
          userTimezone={user?.timezone}
          onEdit={() => {}}
        />
      )}
    </div>
  );
}

export default Topbar;
