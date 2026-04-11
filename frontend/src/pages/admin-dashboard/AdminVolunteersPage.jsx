import React from "react";

const volunteers = [
  {
    id: 1,
    name: "Rohit Sharma",
    type: "NGO",
    ngo: "Animal Rescue Trust"
  },
  {
    id: 2,
    name: "Priya Verma",
    type: "Independent",
    ngo: null
  },
  {
    id: 3,
    name: "Aman Gupta",
    type: "NGO",
    ngo: "Clean City NGO"
  }
];

export default function VolunteersPage() {
  return (
    <div className="p-6 bg-[#F5F7FB] min-h-screen">

      <h1 className="text-lg font-semibold mb-6">
        Volunteers Network
      </h1>

      <div className="bg-white rounded-xl border p-4">

        {volunteers.map((vol) => (
          <div
            key={vol.id}
            className="flex justify-between items-center border-b py-3 last:border-none hover:bg-gray-50 px-2 rounded"
          >

            {/* LEFT */}
            <div>
              <p className="text-sm font-medium">{vol.name}</p>

              {vol.type === "NGO" ? (
                <p className="text-xs text-gray-400">
                  Affiliated with {vol.ngo}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Independent Volunteer
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div>
              {vol.type === "NGO" ? (
                <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                  NGO
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  Independent
                </span>
              )}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}