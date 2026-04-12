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
    name: "Kinjal Gupta",
    email: "kinjal@gmail.com",
    phone: "+91 7078252154",
    location: "Delhi",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-3xl font-bold">
              AK
            </div>

            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-white/10 border border-white/10 rounded-xl px-3 py-2 w-full outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold">{user.name}</h1>
              )}

              <p className="text-slate-300 mt-1">Active Civic Reporter</p>

              <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/20 border border-white/10 text-amber-200 px-4 py-2 rounded-xl text-sm">
                <Award size={16} />
                Level 3 - Civic Champion
              </div>
            </div>

            {editing ? (
              <button
                onClick={saveProfile}
                className="px-5 py-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white flex items-center gap-2 transition"
              >
                <Save size={18} />
                Save
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white transition hover:scale-105"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-5 mt-10">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={18} />
                <span>Email</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 outline-none"
                />
              ) : (
                <p className="mt-2 font-medium">{user.email}</p>
              )}
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone size={18} />
                <span>Phone</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 outline-none"
                />
              ) : (
                <p className="mt-2 font-medium">{user.phone}</p>
              )}
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin size={18} />
                <span>Location</span>
              </div>

              {editing ? (
                <input
                  type="text"
                  name="location"
                  value={user.location}
                  onChange={handleChange}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 outline-none"
                />
              ) : (
                <p className="mt-2 font-medium">{user.location}</p>
              )}
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-300">
                <FileText size={18} />
                <span>Total Reports</span>
              </div>
              <p className="mt-2 font-medium">{user.reports}</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold">Recent Achievements</h3>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-emerald-500/20 border border-white/10 rounded-2xl p-5">
                🏆 First Issue Resolved
              </div>

              <div className="bg-sky-500/20 border border-white/10 rounded-2xl p-5">
                ⭐ 100+ Points Earned
              </div>

              <div className="bg-fuchsia-500/20 border border-white/10 rounded-2xl p-5">
                🎯 Top Contributor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}