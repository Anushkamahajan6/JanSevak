import React, { useState, useEffect } from "react";

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      try {
        const res = await fetch(`${apiBase}/api/admin/issues`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIssues(data || []);
        }
      } catch (err) {
        console.error('Error fetching issues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const calculateTimeAgo = (date) => {
    const now = new Date();
    const issueDate = new Date(date);
    const diff = now - issueDate;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const displayIssues = issues.map((issue) => ({
    id: issue._id || issue.id,
    title: issue.title || issue.category,
    category: issue.category || 'Issue',
    status: (issue.status || 'pending').toUpperCase().replace('-', ' '),
    location: issue.location?.address || 'Unknown',
    time: calculateTimeAgo(issue.createdAt || new Date())
  }));

  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'reported' || lowerStatus === 'pending')
      return 'bg-yellow-100 text-yellow-600';
    if (lowerStatus === 'in progress' || lowerStatus === 'in-progress')
      return 'bg-blue-100 text-blue-600';
    if (lowerStatus === 'resolved')
      return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6 bg-[#F5F7FB] min-h-screen">

      <h1 className="text-lg font-semibold mb-6">
        All Reported Issues
      </h1>

      <div className="bg-white rounded-xl border p-4">

        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading issues...</p>
        ) : displayIssues.length > 0 ? (
          displayIssues.map((issue) => (
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
                  className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.status)}`}
                >
                  {issue.status}
                </span>

                <p className="text-xs text-gray-400 mt-1">
                  {issue.time}
                </p>

              </div>

            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No issues yet</p>
        )}

      </div>

    </div>
  );
}