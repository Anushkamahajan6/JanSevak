import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Clock3,
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
      return "bg-green-100 text-green-700";
    if (status === "In Progress")
      return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getIcon = (status) => {
    if (status === "Resolved")
      return <CheckCircle2 size={16} />;
    if (status === "In Progress")
      return <Loader2 size={16} />;
    return <AlertCircle size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                My Issues
              </h1>
              <p className="text-slate-500 mt-1">
                Track all reported civic issues and their progress.
              </p>
            </div>

            <button
              onClick={() => navigate("/user/report")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium"
            >
              + New Issue
            </button>
          </div>

          {/* Search + Filter */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="md:col-span-2 flex items-center border border-slate-300 rounded-xl px-4">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full px-3 py-3 outline-none"
              />
            </div>

            <button className="flex items-center justify-center gap-2 border border-slate-300 rounded-xl px-4 py-3 hover:bg-slate-50">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {/* Issue Cards */}
          <div className="mt-8 space-y-4">
            {issues.map((item, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <span className="text-xs text-slate-400">
                        {item.id}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
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

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold">
                      {item.points}
                    </span>

                    <button className="text-indigo-600 text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        item.status === "Resolved"
                          ? "w-full bg-green-500"
                          : item.status === "In Progress"
                          ? "w-2/3 bg-blue-500"
                          : "w-1/4 bg-yellow-500"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            <div className="bg-green-50 rounded-2xl p-5">
              <p className="text-sm text-green-700">Resolved</p>
              <h2 className="text-3xl font-bold text-green-800">2</h2>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5">
              <p className="text-sm text-blue-700">In Progress</p>
              <h2 className="text-3xl font-bold text-blue-800">1</h2>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-5">
              <p className="text-sm text-yellow-700">Pending</p>
              <h2 className="text-3xl font-bold text-yellow-800">1</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}