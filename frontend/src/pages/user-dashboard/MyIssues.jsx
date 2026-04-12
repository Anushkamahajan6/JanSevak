  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import {
    ArrowLeft,
    Search,
    Filter,
    CheckCircle2,
    Loader2,
    AlertCircle,
  } from "lucide-react";

  export default function MyIssues() {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchIssues = async () => {
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        try {
          const res = await fetch(`${apiBase}/api/issues`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setIssues(data.issues || []);
          }
        } catch (err) {
          console.error('Error fetching issues:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchIssues();
    }, []);

    const calculateDaysAgo = (date) => {
      const now = new Date();
      const issueDate = new Date(date);
      const diff = now - issueDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return '1 day ago';
      if (days < 7) return `${days} days ago`;
      return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    };

    const displayIssues = issues.map((issue, idx) => ({
      id: `#${issue._id ? issue._id.slice(-4).toUpperCase() : idx}`,
      title: issue.title || issue.category,
      category: issue.category || 'Issue',
      date: calculateDaysAgo(issue.createdAt),
      status: issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 'Pending',
      points: "+50",
    }));

    const getBadge = (status) => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === "resolved")
        return "bg-emerald-500/20 text-emerald-200";
      if (lowerStatus === "in-progress" || lowerStatus === "in progress")
        return "bg-sky-500/20 text-sky-200";
      return "bg-amber-500/20 text-amber-200";
    };

    const getIcon = (status) => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === "resolved") return <CheckCircle2 size={16} />;
      if (lowerStatus === "in-progress" || lowerStatus === "in progress") return <Loader2 size={16} />;
      return <AlertCircle size={16} />;
    };

    const resolved = displayIssues.filter(i => i.status.toLowerCase() === 'resolved').length;
    const inProgress = displayIssues.filter(i => i.status.toLowerCase() === 'in-progress' || i.status.toLowerCase() === 'in progress').length;
    const pending = displayIssues.filter(i => i.status.toLowerCase() === 'pending').length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/user")}
            className="flex items-center gap-2 text-slate-300 hover:text-violet-200 mb-4 transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Issues</h1>
                <p className="text-slate-300 mt-1">
                  Track all reported civic issues and their progress.
                </p>
              </div>

              <button
                onClick={() => navigate("/user/report")}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-medium transition hover:scale-105"
              >
                + New Issue
              </button>
            </div>

            {/* Search */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="md:col-span-2 flex items-center border border-white/10 bg-white/10 rounded-xl px-4">
                <Search size={18} className="text-slate-300" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="w-full px-3 py-3 outline-none bg-transparent text-white placeholder-slate-300"
                />
              </div>

              <button className="flex items-center justify-center gap-2 border border-white/10 bg-white/10 text-slate-200 rounded-xl px-4 py-3 hover:bg-white/15 transition">
                <Filter size={18} />
                Filter
              </button>
            </div>

            {/* Cards */}
            <div className="mt-8 space-y-4">
              {loading ? (
                <p className="text-slate-300 text-center py-8">Loading issues...</p>
              ) : displayIssues.length > 0 ? (
                displayIssues.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <span className="text-xs text-slate-300">{item.id}</span>
                        </div>

                        <p className="text-sm text-slate-300 mt-1">
                          {item.category} • Reported {item.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getBadge(
                            item.status
                          )}`}
                        >
                          {getIcon(item.status)}
                          {item.status}
                        </span>

                        <span className="bg-fuchsia-500/20 text-fuchsia-200 px-3 py-1 rounded-lg text-xs font-semibold">
                          {item.points}
                        </span>

                        <button className="text-violet-200 hover:text-white text-sm font-medium transition">
                          View Details →
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.status.toLowerCase() === "resolved"
                              ? "w-full bg-emerald-400"
                              : item.status.toLowerCase() === "in-progress" || item.status.toLowerCase() === "in progress"
                              ? "w-2/3 bg-sky-400"
                              : "w-1/4 bg-amber-400"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-300 text-center py-8">No issues yet. Start by filing a new issue!</p>
              )}
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mt-10">
              <div className="bg-emerald-500/20 border border-white/10 rounded-2xl p-5">
                <p className="text-sm text-emerald-200">Resolved</p>
                <h2 className="text-3xl font-bold">{resolved}</h2>
              </div>

              <div className="bg-sky-500/20 border border-white/10 rounded-2xl p-5">
                <p className="text-sm text-sky-200">In Progress</p>
                <h2 className="text-3xl font-bold">{inProgress}</h2>
              </div>

              <div className="bg-amber-500/20 border border-white/10 rounded-2xl p-5">
                <p className="text-sm text-amber-200">Pending</p>
                <h2 className="text-3xl font-bold">{pending}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
