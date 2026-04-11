import React from "react";
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

export default function Dashboard() {
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
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "My Issues", icon: Clock3 },
    { name: "File New Issue", icon: FilePlus2 },
    { name: "Points & Rewards", icon: Gift },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  const getStatus = (status) => {
    if (status === "Resolved") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="w-12 h-12 text-lg bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            J
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {item.name}

                {item.name === "My Issues" && (
                  <span className="ml-auto text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
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
            <p className="text-sm font-semibold text-slate-800">Arjun Kumar</p>
            <p className="text-xs text-slate-500">Reporter</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Good morning, Arjun
            </h2>
            <p className="text-sm text-slate-500">
              Saturday, 11 April 2026 — SRM Campus
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center bg-white">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
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

                <button className="text-sm text-indigo-600 font-medium">
                  See all →
                </button>
              </div>

              <div className="space-y-3">
                {issues.map((item, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="w-12 h-12 text-lg bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
  J
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

                  <button className="text-sm text-indigo-600">
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

          {/* Row 3 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Activity */}
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

            {/* Tracker */}
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

            {/* Hotspots */}
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