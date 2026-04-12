import React, { useEffect, useState } from "react";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/volunteer")
        const data = await res.json();
        setVolunteers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVolunteers();
  }, []);
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

              {vol.type === "NGO_Affiliated" ? (
                <p className="text-xs text-gray-400">
                  Affiliated with {vol.ngoName}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Independent Volunteer
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div>
              {vol.type === "NGO_Affiliated" ? (
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