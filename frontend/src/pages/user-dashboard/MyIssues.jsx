import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function MyIssues() {
  const navigate = useNavigate();

  const issues = [
    {
      id: "#1042",
      title: "Broken street light near Gate 2",
      category: "Infrastructure",
      date: "2 days ago",
      status: "In Progress",
      points: "+50",
    },
    {
      id: "#1038",
      title: "Garbage overflow near canteen",
      category: "Sanitation",
      date: "5 days ago",
      status: "Resolved",
      points: "+100",
    },
    {
      id: "#1034",
      title: "Water leakage in hostel block",
      category: "Utilities",
      date: "Today",
      status: "Pending",
      points: "+25",
    },
    {
      id: "#1029",
      title: "Pothole at main road entrance",
      category: "Roads",
      date: "1 week ago",
      status: "Resolved",
      points: "+100",
    },
  ];

  const getBadge = (status) => {
    if (status === "Resolved")
      return "bg-emerald-500/20 text-emerald-200";
    if (status === "In Progress")
      return "bg-sky-500/20 text-sky-200";
    return "bg-amber-500/20 text-amber-200";
  };

  const getIcon = (status) => {
    if (status === "Resolved") return <CheckCircle2 size={16} />;
    if (status === "In Progress") return <Loader2 size={16} />;
    return <AlertCircle size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Issues</h1>
              <p className="text-slate-300 mt-1">
                Track all reported civic issues and their progress.
              </p>
            </div>

            <button
              onClick={() => navigate("/user/report")}
              className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-medium transition hover:scale-105"
            >
              + New Issue
            </button>
          </div>

          {/* Search */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="md:col-span-2 flex items-center border border-white/10 bg-white/10 rounded-xl px-4">
              <Search size={18} className="text-slate-300" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full px-3 py-3 outline-none bg-transparent text-white placeholder-slate-300"
              />
            </div>

            <button className="flex items-center justify-center gap-2 border border-white/10 bg-white/10 text-slate-200 rounded-xl px-4 py-3 hover:bg-white/15 transition">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {/* Cards */}
          <div className="mt-8 space-y-4">
            {issues.map((item, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-xs text-slate-300">{item.id}</span>
                    </div>

                    <p className="text-sm text-slate-300 mt-1">
                      {item.category} • Reported {item.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getBadge(
                        item.status
                      )}`}
                    >
                      {getIcon(item.status)}
                      {item.status}
                    </span>

                    <span className="bg-fuchsia-500/20 text-fuchsia-200 px-3 py-1 rounded-lg text-xs font-semibold">
                      {item.points}
                    </span>

                    <button className="text-violet-200 hover:text-white text-sm font-medium transition">
                      View Details →
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.status === "Resolved"
                          ? "w-full bg-emerald-400"
                          : item.status === "In Progress"
                          ? "w-2/3 bg-sky-400"
                          : "w-1/4 bg-amber-400"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            <div className="bg-emerald-500/20 border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-emerald-200">Resolved</p>
              <h2 className="text-3xl font-bold">2</h2>
            </div>

            <div className="bg-sky-500/20 border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-sky-200">In Progress</p>
              <h2 className="text-3xl font-bold">1</h2>
            </div>

            <div className="bg-amber-500/20 border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-amber-200">Pending</p>
              <h2 className="text-3xl font-bold">1</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}