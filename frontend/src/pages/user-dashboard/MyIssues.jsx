import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, Loader2, AlertCircle, Plus } from "lucide-react";
import { useUser } from "../../context/userContext";

export default function MyIssues() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issues/user/${user.id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setIssues(d.issues || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const daysAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const badge = (status) => {
    const s = status.toLowerCase();
    if (s === "resolved") return { cls: "bg-emerald-500/20 text-emerald-200", icon: <CheckCircle2 size={13} /> };
    if (s === "in-progress") return { cls: "bg-sky-500/20 text-sky-200", icon: <Loader2 size={13} /> };
    return { cls: "bg-amber-500/20 text-amber-200", icon: <AlertCircle size={13} /> };
  };

  const filtered = issues.filter(issue => {
    const status = (issue.status || "pending").toLowerCase();
    const matchFilter = filter === "all" || status === filter;
    const matchSearch = search === "" ||
      (issue.title || issue.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (issue.category || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const resolved = issues.filter(i => i.status === "resolved").length;
  const inProgress = issues.filter(i => i.status === "in-progress").length;
  const pending = issues.filter(i => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/user")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold">My Issues</h1>
              <p className="text-slate-400 text-sm mt-1">Track all issues you've reported.</p>
            </div>
            <button
              onClick={() => navigate("/user/report")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-medium hover:opacity-90 transition flex-shrink-0"
            >
              <Plus size={15} /> New Issue
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Resolved", value: resolved, color: "bg-emerald-500/15 border-emerald-500/20 text-emerald-300" },
              { label: "In Progress", value: inProgress, color: "bg-sky-500/15 border-sky-500/20 text-sky-300" },
              { label: "Pending", value: pending, color: "bg-amber-500/15 border-amber-500/20 text-amber-300" },
            ].map((s, i) => (
              <div key={i} className={`border rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 gap-2">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="text" placeholder="Search issues..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full py-2.5 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
            <select
              value={filter} onChange={e => setFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none"
            >
              <option value="all" className="bg-slate-900">All</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="in-progress" className="bg-slate-900">In Progress</option>
              <option value="resolved" className="bg-slate-900">Resolved</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-slate-400 text-sm text-center py-8">Loading...</p>
            ) : filtered.length > 0 ? (
              filtered.map((issue, i) => {
                const status = issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : "Pending";
                const b = badge(status);
                const progress = status.toLowerCase() === "resolved" ? 100 : status.toLowerCase() === "in-progress" ? 60 : 20;
                return (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{issue.title || issue.category}</h3>
                          <span className="text-xs text-slate-500 flex-shrink-0">#{issue._id?.slice(-4).toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{issue.category} • {daysAgo(issue.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${b.cls}`}>
                          {b.icon} {status}
                        </span>
                        <span className="bg-fuchsia-500/20 text-fuchsia-200 px-2 py-1 rounded-lg text-xs">+10 pts</span>
                      </div>
                    </div>
                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${status.toLowerCase() === "resolved" ? "bg-emerald-400" : status.toLowerCase() === "in-progress" ? "bg-sky-400" : "bg-amber-400"}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-sm text-center py-8">
                {search || filter !== "all" ? "No issues match your filter." : "No issues yet. Start by filing one."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}