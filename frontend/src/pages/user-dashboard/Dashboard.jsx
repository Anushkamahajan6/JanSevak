import React, { useState } from "react";
import {
  Bell,
  LayoutDashboard,
  Clock3,
  FilePlus2,
  Gift,
  User,
  Settings,
  Plus,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
const [showNotifications, setShowNotifications] = useState(false);

const [notifications, setNotifications] = useState([
  { id: 1, text: "Your garbage issue was resolved ✅", read: false },
  { id: 2, text: "New reward unlocked 🎁", read: false },
  { id: 3, text: "Volunteer assigned to your report 👷", read: true },
]);
  const [userName, setUserName] = useState("Arjun");
  const [editingName, setEditingName] = useState(false);
  const [newQuery, setNewQuery] = useState("");

  const stats = [
    {
      title: "Issues Filed",
      value: "12",
      sub: "+2 this week",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Resolved",
      value: "7",
      sub: "+1 resolved",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending",
      value: "3",
      sub: "In Progress",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Total Points",
      value: "340",
      sub: "+50 earned",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const issues = [
    {
      title: "Broken street light — Block C",
      meta: "Infrastructure • Filed 3 days ago",
      status: "In Progress",
      pts: "+50",
      emoji: "💡",
      bg: "bg-yellow-50",
    },
    {
      title: "Garbage overflow near Canteen",
      meta: "Sanitation • Filed 1 week ago",
      status: "Resolved",
      pts: "+100",
      emoji: "🗑️",
      bg: "bg-green-50",
    },
    {
      title: "Pothole on Main Road entrance",
      meta: "Roads • Filed 2 days ago",
      status: "Pending",
      pts: "+50",
      emoji: "🚧",
      bg: "bg-blue-50",
    },
    {
      title: "Water leakage in Hostel Block B",
      meta: "Utilities • Filed today",
      status: "Pending",
      pts: "+50",
      emoji: "💧",
      bg: "bg-red-50",
    },
  ];

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/user" },
    { name: "My Issues", icon: Clock3, path: "/user/issues" },
    { name: "File New Issue", icon: FilePlus2, path: "/user/report" },
    { name: "Points & Rewards", icon: Gift, path: "/user/rewards" },
    { name: "Profile", icon: User, path: "/user/profile" },
    { name: "Settings", icon: Settings, path: "/user/settings" },
  ];

  const [queries, setQueries] = useState([
    "Garbage overflow near canteen",
    "Broken street light in Block C",
    "Water leakage in Hostel B",
  ]);

  const getStatus = (status) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <aside className="w-64 min-w-[256px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-indigo-100">
            🏛️
          </div>

          <h1 className="mt-3 text-lg font-bold text-slate-800">JanSevak</h1>
          <p className="text-xs text-slate-500">Community Issue Portal</p>
        </div>

        <nav className="p-3 space-y-1">
          {nav.map((item, i) => {
            const Icon = item.icon;

            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  location.pathname === item.path
                    ? "bg-indigo-600 text-white font-semibold shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {item.name}

                {item.name === "My Issues" && (
                  <span className="ml-auto text-xs bg-white text-indigo-600 px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
            AK
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {userName} Kumar
            </p>
            <p className="text-xs text-slate-500">Reporter</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {editingName ? (
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="border rounded-lg px-2 py-1"
                />
              ) : (
                <h2 className="text-lg font-semibold text-slate-800">
                  Good morning, {userName}
                </h2>
              )}

              <button
                onClick={() => setEditingName(!editingName)}
                className="text-xs text-indigo-600"
              >
                {editingName ? "Save" : "Edit"}
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Saturday, 11 April 2026 — SRM Campus
            </p>
          </div>

          <div className="flex items-center gap-3">
           <div className="relative">
  <button
    onClick={() => setShowNotifications(!showNotifications)}
    className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50"
  >
    <Bell size={18} />

    {notifications.filter((n) => !n.read).length > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
        {notifications.filter((n) => !n.read).length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-slate-800">
          Notifications
        </h3>

        <button
          onClick={() =>
            setNotifications(
              notifications.map((n) => ({
                ...n,
                read: true,
              }))
            )
          }
          className="text-xs text-indigo-600"
        >
          Mark all read
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl text-sm border ${
              item.read
                ? "bg-slate-50 border-slate-100 text-slate-500"
                : "bg-indigo-50 border-indigo-100 text-slate-800"
            }`}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )}
</div>

            <button
              onClick={() => navigate("/user/report")}
              className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              File New Issue
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${card.color}`}
                  >
                    {card.sub}
                  </div>
                </div>

                <h3 className="mt-4 text-3xl font-bold text-slate-800">
                  {card.value}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{card.title}</p>
              </div>
            ))}
          </section>

          {/* Row 2 */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Issues */}
            <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Recent Issues</h3>

                <button
                  onClick={() => navigate("/user/issues")}
                  className="text-sm text-indigo-600 font-medium"
                >
                  See all →
                </button>
              </div>

              <div className="space-y-3">
                {issues.map((item, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.bg}`}
                    >
                      {item.emoji}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatus(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                      {item.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="space-y-6">
              {/* Points */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-slate-800">Your Points</h3>

                  <button
                    onClick={() => navigate("/user/rewards")}
                    className="text-sm text-indigo-600"
                  >
                    Rewards →
                  </button>
                </div>

                <div className="mt-4 bg-indigo-50 rounded-2xl p-5 text-center">
                  <h2 className="text-4xl font-bold text-indigo-700">340</h2>

                  <p className="text-sm text-indigo-600 mt-1">
                    Civic Champion — Level 3
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Progress to Level 4</span>
                    <span>340 / 500</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Issue Categories
                </h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Infrastructure", 4],
                    ["Sanitation", 3],
                    ["Roads", 2],
                    ["Utilities", 3],
                  ].map((cat, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-xl p-3 flex justify-between"
                    >
                      <span>{cat[0]}</span>
                      <span className="font-semibold">{cat[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Previous Queries */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl transition duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">
                Previous Queries
              </h3>
            </div>

            <div className="space-y-3">
              {queries.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  {item}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="Add new query"
                  className="flex-1 border rounded-xl px-3 py-2"
                />

                <button
                  onClick={() => {
                    if (newQuery.trim()) {
                      setQueries([...queries, newQuery]);
                      setNewQuery("");
                    }
                  }}
                  className="bg-indigo-600 text-white px-4 rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <h3 className="font-semibold text-slate-800 mb-4">
                Monthly Activity
              </h3>

              <div className="flex items-end gap-2 h-28">
                {[30, 55, 40, 80, 60, 90, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-indigo-500 rounded-t-md"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>

              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Oct</span>
                <span>Apr</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <h3 className="font-semibold text-slate-800 mb-4">
                Issue Tracker
              </h3>

              {[
                ["Filed", "100%", "bg-indigo-600"],
                ["In Progress", "25%", "bg-yellow-500"],
                ["Resolved", "58%", "bg-green-500"],
                ["Pending", "17%", "bg-red-500"],
              ].map((item, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item[0]}</span>
                    <span>{item[1]}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item[2]}`}
                      style={{ width: item[1] }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition duration-300">
              <h3 className="font-semibold text-slate-800 mb-4">
                Community Hotspots
              </h3>

              {[
                ["Block C Area", "5 active issues", "High"],
                ["Main Canteen", "3 active issues", "Medium"],
                ["Hostel Block B", "2 active issues", "Low"],
              ].map((spot, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl p-3 flex justify-between items-center mb-3"
                >
                  <div>
                    <p className="text-sm font-medium">{spot[0]}</p>
                    <p className="text-xs text-slate-500">{spot[1]}</p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      spot[2] === "High"
                        ? "bg-red-100 text-red-700"
                        : spot[2] === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {spot[2]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}