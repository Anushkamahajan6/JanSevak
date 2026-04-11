import React from "react";

export default function SettingsPage() {
  return (
    <div className="p-6 bg-[#F5F7FB] min-h-screen">

      <h1 className="text-lg font-semibold mb-6">
        Admin Settings
      </h1>

      <div className="grid grid-cols-2 gap-6">

        {/* PROFILE */}
        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-sm font-medium mb-4">Profile</h2>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-gray-400 text-xs">Name</label>
              <input
                type="text"
                value="Admin User"
                className="w-full border rounded px-2 py-1 mt-1"
                readOnly
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs">Email</label>
              <input
                type="text"
                value="admin@jansevak.org"
                className="w-full border rounded px-2 py-1 mt-1"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* NGO INFO */}
        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-sm font-medium mb-4">NGO Information</h2>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-gray-400 text-xs">Organization</label>
              <input
                type="text"
                value="Animal Rescue Trust"
                className="w-full border rounded px-2 py-1 mt-1"
                readOnly
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs">Location</label>
              <input
                type="text"
                value="Gurgaon"
                className="w-full border rounded px-2 py-1 mt-1"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white border rounded-xl p-4 col-span-2">
          <h2 className="text-sm font-medium mb-4">Notifications</h2>

          <div className="flex items-center justify-between text-sm">
            <span>Receive new issue alerts</span>
            <button className="bg-indigo-600 text-white px-3 py-1 rounded">
              Enabled
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}