import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { LogOut, User } from "lucide-react";
import { logoutUser } from "../features/authSlice";
import Button from "./ui/Button";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const handleSignIn = () => navigate("/login");
  const handleSignUp = () => navigate("/register");

  return (
    <div className="flex justify-end px-6 py-4 bg-white shadow-sm items-center gap-4">
      {!isAuthenticated ? (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button onClick={handleSignUp}>
            Sign Up
          </Button>
        </div>
      ) : (
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
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/profile")}>
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
      )}
    </div>
  );
}

export default Topbar;
