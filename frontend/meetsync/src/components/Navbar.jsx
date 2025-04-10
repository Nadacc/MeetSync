import React from "react";
import {
  PlusCircle,
  Home,
  Video,
  CalendarDays
} from "lucide-react";
import Input from "../ui/Input";
import Label from "../ui/Label";

const navItems = [
  { id: "create", icon: PlusCircle, label: "Create Meeting" },
  { id: "home", icon: Home, label: "Home" },
  { id: "video", icon: Video, label: "Video Meeting" },
  { id: "calendar", icon: CalendarDays, label: "Calendar" }
];

const Navbar = ({ selected, setSelected }) => (
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
      {navItems.map(({ id, icon: Icon, label }) => (
        <Label
          key={id}
          htmlFor={id}
          className="flex items-center gap-4 px-4 py-3 rounded-xl relative transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-300 group"
        >
          <Input
            type="radio"
            name="sidebar"
            id={id}
            checked={selected === id}
            onChange={() => setSelected(id)}
            className="hidden peer"
          />

          {/* Active tab indicator */}
          <span
            className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 transition-opacity duration-300 ${
              selected === id ? "opacity-100" : "opacity-0"
            }`}
          />

          <div className="w-8 h-8 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600 peer-checked:text-blue-500 peer-checked:scale-110 transition-transform duration-300" />
          </div>

          <span className="text-gray-800 text-base whitespace-nowrap overflow-hidden opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300">
            {label}
          </span>

          {/* Tooltip */}
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover/sidebar:hidden group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 pointer-events-none">
            {label}
          </span>
        </Label>
      ))}
    </div>
  </aside>
);

export default Navbar;
