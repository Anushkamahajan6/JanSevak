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

  // Load saved settings
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userSettings"));

    if (saved) {
      setNotifications(saved.notifications);
      setDarkMode(saved.darkMode);
      setLocation(saved.location);
    }
  }, []);

  // Apply dark mode
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
        value ? "bg-indigo-600" : "bg-slate-300"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/user")}
          className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Settings
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your preferences and account settings.
          </p>

          <div className="mt-8 space-y-5">
            {/* Notifications */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Bell className="text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-800">
                    Notifications
                  </p>
                  <p className="text-sm text-slate-500">
                    Receive issue updates and alerts
                  </p>
                </div>
              </div>

              <Toggle
                value={notifications}
                onClick={() =>
                  setNotifications(!notifications)
                }
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Moon className="text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-800">
                    Dark Mode
                  </p>
                  <p className="text-sm text-slate-500">
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
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <Globe className="text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-800">
                    Location Access
                  </p>
                  <p className="text-sm text-slate-500">
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
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-5">
              <Shield className="text-indigo-600" />
              <div>
                <p className="font-medium text-slate-800">
                  Privacy Policy
                </p>
                <p className="text-sm text-slate-500">
                  Read terms & privacy details
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={saveSettings}
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}