// Pages/Home.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";

function HomeLayout() {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <Topbar />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
