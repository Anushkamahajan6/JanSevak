import React from "react";

const issues = [
  {
    id: 1,
    title: "Injured stray dog",
    category: "Animal Welfare",
    status: "IN PROGRESS",
    location: "Sector 12",
    time: "2 mins ago"
  },
  {
    id: 2,
    title: "Garbage overflow",
    category: "Waste",
    status: "REPORTED",
    location: "Block A",
    time: "10 mins ago"
  },
  {
    id: 3,
    title: "Broken road",
    category: "Roads",
    status: "RESOLVED",
    location: "Sector 8",
    time: "1 hour ago"
  }
];

export default function IssuesPage() {
  return (
    <div className="p-6 bg-[#F5F7FB] min-h-screen">

      <h1 className="text-lg font-semibold mb-6">
        All Reported Issues
      </h1>

      <div className="bg-white rounded-xl border p-4">

        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex justify-between items-center border-b py-3 last:border-none hover:bg-gray-50 px-2 rounded"
          >

            {/* LEFT */}
            <div>
              <p className="text-sm font-medium">{issue.title}</p>
              <p className="text-xs text-gray-400">
                {issue.category} • {issue.location}
              </p>
            </div>

            {/* RIGHT */}
            <div className="text-right">

              <span
                className={`text-xs px-2 py-1 rounded ${
                  issue.status === "REPORTED"
                    ? "bg-yellow-100 text-yellow-600"
                    : issue.status === "IN PROGRESS"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {issue.status}
              </span>

              <p className="text-xs text-gray-400 mt-1">
                {issue.time}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}