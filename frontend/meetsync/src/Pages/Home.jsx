import React, { useState } from "react";
import Dashboard from "../components/Dashboard";
import CreateMeeting from '../components/CreateMeeting'
import Meeting from "../components/Meeting";
import Calender from "../components/Calender";
import Navbar from "../components/Navbar";
import Header from "../ui/Header";
import Topbar from "../components/Topbar";

function Home() {
  const [selected, setSelected] = useState("home");

  const renderContent = () => {
    switch (selected) {
      case "home":
        return <Dashboard/>;
      case "create":
        return <CreateMeeting/>;
      case "video":
        return <Meeting/>;
      case "calendar":
        return <Calender/>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      <Navbar selected={selected} setSelected={setSelected} />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        
        <Topbar/>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};



export default Home;
