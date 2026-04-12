import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import HeatmapView from '../../components/HeatmapView';

export default function AdminPage() {

  // 🔥 NEW STATE (core feature)
  const [status, setStatus] = useState("REPORTED");
  const [deployed, setDeployed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);

  // 🔥 NEW: active route detection
  const location = useLocation();
  const volunteers = [
    { id: 1, name: "Rohit Sharma", type: "NGO", ngo: "Animal Rescue Trust" },
    { id: 2, name: "Priya Verma", type: "Independent", ngo: null },
    { id: 3, name: "Aman Gupta", type: "NGO", ngo: "Clean City NGO" }
  ];

  const toggleVolunteer = (id) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">

      {/* SIDEBAR */}
      <div className="w-[220px] bg-white border-r p-5 flex flex-col justify-between">

        <div>
          <h2 className="text-lg font-semibold text-[#4338CA] mb-8">
            JanSevak
          </h2>

          <nav className="space-y-2 text-sm text-gray-600">

            <Link
              to="/admin"
              className={`block px-3 py-2 rounded-lg ${location.pathname === "/admin"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-100"
                }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/issues"
              className={`block px-3 py-2 rounded-lg ${location.pathname === "/admin/issues"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-100"
                }`}
            >
              All Issues
            </Link>

            <Link
              to="/admin/volunteers"
              className={`block px-3 py-2 rounded-lg ${location.pathname === "/admin/volunteers"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-100"
                }`}
            >
              Volunteers
            </Link>

            <Link
              to="/admin/settings"
              className={`block px-3 py-2 rounded-lg ${location.pathname === "/admin/settings"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-100"
                }`}
            >
              Settings
            </Link>

          </nav>
        </div>

        {/* USER FOOTER */}
        <div className="flex items-center gap-3 mt-6">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm text-indigo-700">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">NGO Panel</p>
          </div>
        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1">

        {/* TOPBAR */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">
              Real-time coordination panel
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#4338CA] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
          >
            🚀 Deploy Volunteers
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">

          {deployed && (
            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm">
              ✅ {selectedVolunteers.length} Volunteers notified nearby
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">

            <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
              <p className="text-xs text-gray-400">Hotspots</p>
              <h2 className="text-2xl font-semibold text-red-500">12</h2>
            </div>

            <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
              <p className="text-xs text-gray-400">Active Volunteers</p>
              <h2 className="text-2xl font-semibold text-green-600">45</h2>
            </div>

            <div className="bg-white border rounded-xl p-4 hover:shadow-md transition">
              <p className="text-xs text-gray-400">Animal Cases</p>
              <h2 className="text-2xl font-semibold">8</h2>
            </div>

          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-4">

            {/* MAP */}
            <div className="col-span-2 bg-white border rounded-xl p-4 h-[350px] flex flex-col overflow-hidden">

              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Live Heatmap</h3>
                <span className="text-xs text-gray-400">Real-time</span>
              </div>

              <div className="flex-1 overflow-hidden">
                <HeatmapView />
              </div>

            </div>

            {/* REPORTS */}
            <div className="bg-white border rounded-xl p-4 h-[350px] overflow-y-auto">

              <h3 className="text-sm font-medium mb-3">Recent Reports</h3>

              <div className="space-y-3">

                <div className="p-3 bg-gray-50 rounded-lg hover:shadow transition">

                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">
                      Injured stray near Sector 12
                    </p>

                    <span className={`text-[10px] px-2 py-1 rounded ${status === "REPORTED"
                      ? "bg-yellow-100 text-yellow-600"
                      : status === "IN PROGRESS"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                      }`}>
                      {status}
                    </span>

                  </div>

                  <p className="text-xs text-gray-400">
                    Animal Welfare • 2 mins ago
                  </p>
                  <p className="text-xs mt-1">📍 GPS • 👍 15</p>

                  {status === "IN PROGRESS" && (
                    <button
                      onClick={() => setStatus("RESOLVED")}
                      className="text-xs text-indigo-600 mt-2"
                    >
                      Mark as Resolved
                    </button>
                  )}

                </div>

                <div className="p-3 bg-gray-50 rounded-lg hover:shadow transition">
                  <p className="text-sm font-medium">
                    Garbage overflow near Block A
                  </p>
                  <p className="text-xs text-gray-400">
                    Waste • 10 mins ago
                  </p>
                  <p className="text-xs mt-1">📍 GPS • 👍 9</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white w-[400px] rounded-xl p-6">

            <h2 className="text-lg font-semibold mb-4">
              Assign Volunteers
            </h2>

            <div className="space-y-3 max-h-[200px] overflow-y-auto">

              {volunteers.map((v) => (
                <div key={v.id} className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium">{v.name}</p>

                    {v.type === "NGO" ? (
                      <p className="text-xs text-gray-400">
                        {v.ngo}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Independent Volunteer
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">

                    <span className={`text-[10px] px-2 py-1 rounded ${v.type === "NGO"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-600"
                      }`}>
                      {v.type}
                    </span>

                    <input
                      type="checkbox"
                      onChange={() => toggleVolunteer(v.id)}
                    />

                  </div>

                </div>
              ))}

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowModal(false);
                  setDeployed(true);
                  setStatus("IN PROGRESS");
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Confirm Deployment
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}