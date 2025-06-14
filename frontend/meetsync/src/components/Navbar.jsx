import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Home,
  Video,
  CalendarDays
} from "lucide-react";

const navItems = [
  { to: "/app/create-meeting", icon: PlusCircle, label: "Create Meeting" },
  { to: "/app/dashboard", icon: Home, label: "Home" },
  { to: "/app/meetings", icon: Video, label: "Video Meeting" },
  { to: "/app/calender", icon: CalendarDays, label: "Calendar" }
];

const Navbar = () => {
  const location = useLocation();

  return (
    <aside className="group/sidebar fixed top-0 left-0 w-16 hover:w-56 transition-all duration-300 h-screen bg-white shadow-xl flex flex-col items-start py-4 overflow-hidden z-50">
      
      <div className="flex items-center w-full px-4 pb-6">
        <img
          src="meetlogo.png"
          alt="Logo"
          className="w-10 h-10 object-contain transition-all duration-300 group-hover/sidebar:w-12 group-hover/sidebar:h-12"
        />
        <span className="ml-2 text-xl font-semibold text-gray-800 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap">
          MeetSync
        </span>
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg relative transition-all duration-200 cursor-pointer 
                hover:bg-blue-50 group
                ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <span
                className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                isActive ? "bg-blue-100" : "group-hover:bg-blue-100/50"
              }`}>
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
              </div>
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300">
                {label}
              </span>
              
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover/sidebar:hidden group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Navbar;