import React, { useEffect, useState } from "react";
import Header from "./ui/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeetings, clearRefreshNeeded } from "../features/meetingSlice";
import MeetingCard from "./MeetingCard";
import MeetingModal from "./MeetingModal";
import { DateTime } from "luxon";
import { Tabs, Tab } from '../components/ui/Tabs';
import { Calendar, Search } from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { created, invited, error, refreshNeeded } = useSelector((state) => state.meeting);
  const userTimezone = useSelector((state) => state.auth.user?.timezone);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [formMode, setFormMode] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchMeetings());
  }, [dispatch]);

  useEffect(() => {
    if (refreshNeeded) {
      dispatch(fetchMeetings());
      dispatch(clearRefreshNeeded());
    }
  }, [refreshNeeded, dispatch]);

  const closeModal = () => setSelectedMeeting(null);

  const isSameDay = (isoString) => {
    if (!selectedDate) return true;
    const meetingDate = DateTime.fromISO(isoString, { zone: userTimezone }).toISODate();
    return meetingDate === selectedDate;
  };

  const getCategory = (isoString) => {
    const now = DateTime.local().setZone(userTimezone);
    const date = DateTime.fromISO(isoString, { zone: userTimezone });

    if (date.hasSame(now, "day")) return "today";
    if (date < now.startOf("day")) return "past";
    return "upcoming";
  };

  const filterMeetings = (meetings) => {
    const filteredByDate = meetings.filter((m) => isSameDay(m.startTime));
    const filteredBySearch = filteredByDate.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.agenda.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      all: filteredBySearch,
      today: filteredBySearch.filter((m) => getCategory(m.startTime) === "today"),
      upcoming: filteredBySearch.filter((m) => getCategory(m.startTime) === "upcoming"),
      past: filteredBySearch.filter((m) => getCategory(m.startTime) === "past"),
    };
  };

  const categorizedCreated = filterMeetings(created);
  const categorizedInvited = filterMeetings(invited);

  const handleEdit = (meeting) => {
    setFormMode("edit");
    setEditingMeeting(meeting);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Home" className="bg-white border-b border-gray-200" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-8 bg-gray-50 p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Meetings
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or agenda"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full h-12 border-none bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 w-full h-12 border-none bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50">
          <Tabs className="border-b border-gray-200 bg-white">
            {["all", "today", "upcoming", "past"].map((type) => (
              <Tab
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                className="px-6 py-4 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200"
                activeClassName="text-blue-600 border-b-2 border-blue-600"
              >
                <div className="p-6 space-y-12 bg-gray-50">
                  {/* My Meetings Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        My Meetings
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {categorizedCreated[type].length} meetings
                      </span>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
                        <p className="text-red-600 font-medium">Error: {error}</p>
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {categorizedCreated[type].length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-600">No {type} meetings found</h3>
                          <p className="mt-2 text-sm text-gray-400">Create a new meeting to get started</p>
                        </div>
                      ) : (
                        categorizedCreated[type].map((meeting) => (
                          <MeetingCard
                            key={meeting._id}
                            meeting={meeting}
                            onClick={setSelectedMeeting}
                            className="bg-white p-4 hover:bg-gray-100 transition-colors duration-200"
                          />
                        ))
                      )}
                    </div>
                  </section>

                  {/* Invited Meetings Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Invited Meetings
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        {categorizedInvited[type].length} meetings
                      </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {categorizedInvited[type].length === 0 ? (
                        <div className="col-span-full py-16 text-center">
                          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-600">No {type} invited meetings</h3>
                          <p className="mt-2 text-sm text-gray-400">You'll see invitations here when received</p>
                        </div>
                      ) : (
                        categorizedInvited[type].map((meeting) => (
                          <MeetingCard
                            key={meeting._id}
                            meeting={meeting}
                            showOrganizer
                            onClick={setSelectedMeeting}
                            className="bg-white p-4 hover:bg-gray-100 transition-colors duration-200"
                          />
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Meeting Modal */}
      {selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          onClose={closeModal}
          isMyMeeting={created.some((m) => m._id === selectedMeeting._id)}
          userTimezone={userTimezone}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;