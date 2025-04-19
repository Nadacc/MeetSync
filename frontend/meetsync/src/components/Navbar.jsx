// Navbar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Home,
  Video,
  CalendarDays
} from "lucide-react";

const navItems = [
  { to: "/create-meeting", icon: PlusCircle, label: "Create Meeting" },
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/meetings", icon: Video, label: "Video Meeting" },
  { to: "/calender", icon: CalendarDays, label: "Calendar" }
];

const Navbar = () => {
  const location = useLocation();

  return (
    <aside className="group/sidebar w-16 hover:w-56 transition-all duration-300 min-h-screen bg-white shadow-xl flex flex-col items-start py-4 overflow-hidden relative">
      
      {/* Logo Section */}
      <div className="flex items-center w-full px-4 pb-6">
        <img
          src="meetlogo.png"
          alt="Logo"
          className="w-12 h-12 object-contain transition-all duration-300 group-hover/sidebar:w-14 group-hover/sidebar:h-14"
        />
        <span className="ml-2 text-xl font-semibold text-gray-800 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap">
          MeetSync
        </span>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-3 w-full">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl relative transition-all duration-300 cursor-pointer 
                border-transparent hover:border-gray-300 
                hover:bg-blue-50 hover:text-blue-600 group
                ${isActive ? ' text-blue-600' : ''}`}
            >
              {/* Active tab indicator */}
              <span
                className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="w-8 h-8 flex items-center justify-center">
                <Icon
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isActive ? "text-blue-600 scale-110" : "text-gray-600 group-hover:text-blue-600"
                  }`}
                />
              </div>
              <span className="text-gray-800 text-base whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300">
                {label}
              </span>
              {/* Tooltip */}
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
