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
    { title: "Issues Filed", value: "12", sub: "+2 this week" },
    { title: "Resolved", value: "7", sub: "+1 resolved" },
    { title: "Pending", value: "3", sub: "In Progress" },
    { title: "Total Points", value: "340", sub: "+50 earned" },
  ];

  const issues = [
    {
      title: "Broken street light — Block C",
      meta: "Infrastructure • Filed 3 days ago",
      status: "In Progress",
      pts: "+50",
      emoji: "💡",
    },
    {
      title: "Garbage overflow near Canteen",
      meta: "Sanitation • Filed 1 week ago",
      status: "Resolved",
      pts: "+100",
      emoji: "🗑️",
    },
    {
      title: "Pothole on Main Road entrance",
      meta: "Roads • Filed 2 days ago",
      status: "Pending",
      pts: "+50",
      emoji: "🚧",
    },
    {
      title: "Water leakage in Hostel Block B",
      meta: "Utilities • Filed today",
      status: "Pending",
      pts: "+50",
      emoji: "💧",
    },
  ];

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/user" },
    { name: "My Issues", icon: Clock3, path: "/user/my-issues" },
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

  const badge = (status) => {
    if (status === "Resolved")
      return "bg-emerald-500/20 text-emerald-200";
    if (status === "In Progress")
      return "bg-sky-500/20 text-sky-200";
    return "bg-amber-500/20 text-amber-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            J
          </div>
          <h1 className="mt-3 font-bold text-lg">JanSevak</h1>
          <p className="text-sm text-slate-300">Community Issue Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          {nav.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                  location.pathname === item.path
                    ? "bg-white/15"
                    : "hover:bg-white/10 text-slate-200"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10 flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
            AK
          </div>
          <div>
            <p className="font-semibold text-sm">Arjun Kumar</p>
            <p className="text-xs text-slate-300">Reporter</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Good morning, {userName}</h2>
            <p className="text-sm text-slate-300">
              Saturday, 11 April 2026 — SRM Campus
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Bell size={18} />
            </button>

            <button
              onClick={() => navigate("/user/report")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center gap-2"
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
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
              >
                <div className="text-xs text-violet-200 bg-white/10 px-3 py-1 rounded-lg w-fit">
                  {card.sub}
                </div>
                <h3 className="text-3xl font-bold mt-4">{card.value}</h3>
                <p className="text-slate-300">{card.title}</p>
              </div>
            ))}
          </section>

          {/* Row 2 */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Issues */}
            <div className="xl:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between mb-4">
                <h3 className="font-bold">Recent Issues</h3>
                <button className="text-violet-200">See all →</button>
              </div>

              <div className="space-y-3">
                {issues.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      {item.emoji}
                    </div>

                    <div className="flex-1">
                      <p>{item.title}</p>
                      <p className="text-sm text-slate-300">{item.meta}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs ${badge(item.status)}`}>
                      {item.status}
                    </span>

                    <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-200 rounded-lg text-xs">
                      {item.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between">
                  <h3 className="font-bold">Your Points</h3>
                  <button className="text-violet-200">Rewards →</button>
                </div>

                <div className="mt-4 bg-white/10 rounded-2xl p-6 text-center">
                  <h2 className="text-5xl font-bold">340</h2>
                  <p className="text-slate-300">Civic Champion — Level 3</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <h3 className="font-bold mb-4">Issue Categories</h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Infrastructure", 4],
                    ["Sanitation", 3],
                    ["Roads", 2],
                    ["Utilities", 3],
                  ].map((cat, i) => (
                    <div
                      key={i}
                      className="bg-white/10 rounded-xl p-3 flex justify-between"
                    >
                      <span>{cat[0]}</span>
                      <span>{cat[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
  <h3 className="font-bold mb-4">Monthly Activity</h3>

  <div className="flex items-end gap-2 h-32">
    {[30, 55, 40, 80, 60, 90, 100].map((h, i) => (
      <div
        key={i}
        className="flex-1 bg-violet-300 hover:bg-violet-200 rounded-t-md transition"
        style={{ height: `${h}%` }}
      ></div>
    ))}
  </div>

  <div className="flex justify-between text-xs text-slate-300 mt-2">
    <span>Oct</span>
    <span>Apr</span>
  </div>
</div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
  <h3 className="font-bold mb-4">Issue Tracker</h3>

  {[
    ["Filed", "100%", "bg-violet-300"],
    ["In Progress", "25%", "bg-amber-300"],
    ["Resolved", "58%", "bg-emerald-300"],
    ["Pending", "17%", "bg-rose-300"],
  ].map((item, i) => (
    <div key={i} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{item[0]}</span>
        <span>{item[1]}</span>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${item[2]} rounded-full`}
          style={{ width: item[1] }}
        ></div>
      </div>
    </div>
  ))}
</div>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
              <h3 className="font-bold mb-4">Community Hotspots</h3>

              {[
                ["Block C Area", "High"],
                ["Main Canteen", "Medium"],
                ["Hostel Block B", "Low"],
              ].map((spot, i) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-xl p-3 mb-3 flex justify-between"
                >
                  <span>{spot[0]}</span>
                  <span>{spot[1]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}