import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  Globe,
  Save,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userSettings"));
    if (saved) {
      setNotifications(saved.notifications);
      setDarkMode(saved.darkMode);
      setLocation(saved.location);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("bg-slate-900");
      document.body.classList.remove("bg-white");
    } else {
      document.body.classList.remove("bg-slate-900");
      document.body.classList.add("bg-white");
    }
  }, [darkMode]);

  const saveSettings = () => {
    const data = {
      notifications,
      darkMode,
      location,
    };

    localStorage.setItem("userSettings", JSON.stringify(data));
    alert("Settings Saved Successfully ✅");
  };

  const Toggle = ({ value, onClick }) => (
    <button
      onClick={onClick}
      className={`w-14 h-8 rounded-full transition ${
        value
          ? "bg-gradient-to-r from-violet-500 to-indigo-500"
          : "bg-white/20"
      }`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full mt-1 transition ${
          value ? "translate-x-7" : "translate-x-1"
        }`}
      ></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <h1 className="text-3xl font-bold">Settings</h1>

          <p className="text-slate-300 mt-2">
            Manage your preferences and account settings.
          </p>

          <div className="mt-8 space-y-5">
            {/* Notifications */}
            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Bell className="text-violet-200" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-slate-300">
                    Receive issue updates and alerts
                  </p>
                </div>
              </div>

              <Toggle
                value={notifications}
                onClick={() => setNotifications(!notifications)}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Moon className="text-violet-200" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-slate-300">
                    Enable dark theme
                  </p>
                </div>
              </div>

              <Toggle
                value={darkMode}
                onClick={() => setDarkMode(!darkMode)}
              />
            </div>

            {/* Location */}
            <div className="flex items-center justify-between bg-white/10 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Globe className="text-violet-200" />
                <div>
                  <p className="font-medium">Location Access</p>
                  <p className="text-sm text-slate-300">
                    Allow GPS for issue reporting
                  </p>
                </div>
              </div>

              <Toggle
                value={location}
                onClick={() => setLocation(!location)}
              />
            </div>

            {/* Privacy */}
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl p-5">
              <Shield className="text-violet-200" />
              <div>
                <p className="font-medium">Privacy Policy</p>
                <p className="text-sm text-slate-300">
                  Read terms & privacy details
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={saveSettings}
            className="mt-8 w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition hover:scale-[1.02]"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}