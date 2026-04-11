import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Award,
  FileText,
  Save,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [user, setUser] = useState({
    name: "Arjun Kumar",
    email: "arjun@gmail.com",
    phone: "+91 9876543210",
    location: "Gurgaon, Haryana",
    reports: "12 Issues Submitted",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setEditing(false);
    alert("Profile Updated Successfully ✅");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-bold">
              AK
            </div>

            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="text-3xl font-bold border rounded-xl px-3 py-2 w-full"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-800">
                  {user.name}
                </h1>
              )}

              <p className="text-slate-500 mt-1">
                Active Civic Reporter
              </p>

              <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm">
                <Award size={16} />
                Level 3 - Civic Champion
              </div>
            </div>

            {editing ? (
              <button
                onClick={saveProfile}
                className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Save size={18} />
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            {/* Email */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail size={18} />
                <span>Email</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="mt-2 w-full border rounded-xl px-3 py-2"
                />
              ) : (
                <p className="mt-2 font-medium text-slate-800">
                  {user.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone size={18} />
                <span>Phone</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className="mt-2 w-full border rounded-xl px-3 py-2"
                />
              ) : (
                <p className="mt-2 font-medium text-slate-800">
                  {user.phone}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin size={18} />
                <span>Location</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="location"
                  value={user.location}
                  onChange={handleChange}
                  className="mt-2 w-full border rounded-xl px-3 py-2"
                />
              ) : (
                <p className="mt-2 font-medium text-slate-800">
                  {user.location}
                </p>
              )}
            </div>

            {/* Reports */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText size={18} />
                <span>Total Reports</span>
              </div>
              <p className="mt-2 font-medium text-slate-800">
                {user.reports}
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-slate-800">
              Recent Achievements
            </h3>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-green-50 rounded-2xl p-5">
                🏆 First Issue Resolved
              </div>

              <div className="bg-blue-50 rounded-2xl p-5">
                ⭐ 100+ Points Earned
              </div>

              <div className="bg-purple-50 rounded-2xl p-5">
                🎯 Top Contributor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}