import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "#0f1117", fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        .topbar { background: rgba(15,17,23,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
        .field-input { width: 100%; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; margin-top: 4px; }
        .toggle-btn { background: linear-gradient(135deg, #6366f1, #7c3aed); color: white; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 3px 12px rgba(99,102,241,0.3); transition: all 0.2s; }
        .toggle-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(99,102,241,0.45); }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar px-6 py-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-indigo-400" />
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            Admin Settings
          </h1>
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>Manage your profile and preferences</p>
      </div>

      <div className="p-6 grid grid-cols-2 gap-5">

        {/* PROFILE */}
        <div className="panel">
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>Profile</h2>
          <div className="space-y-4">
            <div>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Name</label>
              <input type="text" defaultValue="Admin User" className="field-input" readOnly />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Email</label>
              <input type="text" defaultValue="admin@jansevak.org" className="field-input" readOnly />
            </div>
          </div>
        </div>

        {/* NGO INFO */}
        <div className="panel">
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>NGO Information</h2>
          <div className="space-y-4">
            <div>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Organization</label>
              <input type="text" defaultValue="Animal Rescue Trust" className="field-input" readOnly />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Location</label>
              <input type="text" defaultValue="Gurgaon" className="field-input" readOnly />
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="panel col-span-2">
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Receive new issue alerts</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>Get notified when a new issue is reported in your area</p>
            </div>
            <button className="toggle-btn">Enabled</button>
          </div>
        </div>

      </div>
    </div>
  );
}