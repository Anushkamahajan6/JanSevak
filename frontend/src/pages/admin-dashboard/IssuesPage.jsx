import React, { useState, useEffect } from "react";
import { ListChecks, RefreshCw, ChevronDown } from "lucide-react";
import { fetchAdminIssues, updateIssueStatus } from "../../api/adminApi";

const STATUS_OPTIONS = ['open', 'pending', 'in-progress', 'resolved'];

const statusStyle = {
  'open':        { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)",  color: "#fbbf24", label: "OPEN" },
  'pending':     { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)",  color: "#fbbf24", label: "PENDING" },
  'in-progress': { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)", color: "#60a5fa", label: "IN PROGRESS" },
  'resolved':    { bg: "rgba(16,185,129,0.15)",   border: "rgba(16,185,129,0.3)", color: "#34d399", label: "RESOLVED" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function IssuesPage() {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');
  const [updating, setUpdating] = useState(null); // issueId being updated

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminIssues();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdating(issueId);
    try {
      await updateIssueStatus(issueId, newStatus);
      setIssues((prev) => prev.map(i => i._id === issueId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "#0f1117", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        .topbar { background: rgba(15,17,23,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
        .issue-row { border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.15s; }
        .issue-row:last-child { border-bottom: none; }
        .issue-row:hover { background: rgba(99,102,241,0.05); }
        .filter-btn { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 5px 14px; font-size: 12px; font-weight: 500; transition: all 0.15s; cursor: pointer; }
        .filter-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); color: #a5b4fc; }
        .filter-btn:not(.active) { background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4); }
        .filter-btn:not(.active):hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .status-select { background: transparent; border: none; outline: none; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 6px; border-radius: 6px; }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-indigo-400" />
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
              All Reported Issues
            </h1>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              {issues.length} total issues
            </p>
          </div>
        </div>
        <button onClick={load} style={{ color: "rgba(255,255,255,0.4)" }} className="hover:text-white transition p-2 rounded-lg hover:bg-white/5">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* FILTERS */}
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'open', 'pending', 'in-progress', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? 'active' : ''}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {issues.filter(i => i.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <div className="panel">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="issue-row flex justify-between items-center py-4 px-5">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-32" />
                </div>
                <div className="skeleton h-7 w-24 rounded-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
              No issues found
            </div>
          ) : filtered.map((issue) => {
            const s = statusStyle[issue.status] || statusStyle['open'];
            return (
              <div key={issue._id} className="issue-row flex justify-between items-center py-4 px-5 gap-4">
                {/* LEFT */}
                <div className="min-w-0">
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)" }} className="truncate">
                    {issue.title || issue.category}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                    {issue.category} • {issue.location?.address || 'Location on map'} • {timeAgo(issue.createdAt)}
                  </p>
                </div>

                {/* RIGHT: editable status dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  {updating === issue._id ? (
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="relative flex items-center" style={{
                      background: s.bg, border: `1px solid ${s.border}`, borderRadius: "999px", paddingRight: "6px"
                    }}>
                      <select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                        className="status-select"
                        style={{ color: s.color }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} style={{ background: "#13141f", color: "#fff" }}>
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={10} style={{ color: s.color, pointerEvents: 'none' }} />
                    </div>
                  )}
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                    👍 {issue.upvotes ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}