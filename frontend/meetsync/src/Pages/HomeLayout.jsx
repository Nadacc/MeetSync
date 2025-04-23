// Pages/Home.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";

function HomeLayout() {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="w-16 shrink-0 group-hover/sidebar:w-56 transition-all duration-300" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <Topbar />
        <div className="p-4 sm:p-6 pt-20 sm:pt-24"> 
          <Outlet />
        </div>
      </div>
    </div>
  );
}


export default HomeLayout;
