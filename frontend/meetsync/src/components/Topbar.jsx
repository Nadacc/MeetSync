import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { LogOut, User } from "lucide-react";
import { logoutUser } from "../features/authSlice";

function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="flex justify-end px-6 py-4 bg-white shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-gray-300">
            <img
              src="https://i.pravatar.cc/150?img=12"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mt-2">
          <DropdownMenuItem className="flex items-center gap-2">
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
  );
}

export default Topbar;
