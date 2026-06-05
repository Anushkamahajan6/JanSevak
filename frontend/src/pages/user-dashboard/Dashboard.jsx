import { useState, useEffect } from "react";
import { Bell, LayoutDashboard, Clock3, FilePlus2, Gift, User, Settings, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalIssues: 0, resolved: 0, pending: 0, inProgress: 0 });
  const [userIssues, setUserIssues] = useState([]);

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [statsRes, issuesRes] = await Promise.all([
          fetch(`${apiBase}/api/user/dashboard`, { credentials: "include" }),
          fetch(`${apiBase}/api/issues/user/${user.id}`, { credentials: "include" }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (issuesRes.ok) {
          const d = await issuesRes.json();
          setUserIssues(d.issues || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Points: 10 per issue filed, +20 bonus per resolved
  const points = stats.totalIssues * 10 + stats.resolved * 20;

  const getLevel = (pts) => {
    if (pts >= 500) return "Level 4 — Community Leader";
    if (pts >= 300) return "Level 3 — Civic Champion";
    if (pts >= 100) return "Level 2 — Active Reporter";
    return "Level 1 — New Reporter";
  };

  const statCards = [
    { title: "Issues Filed", value: stats.totalIssues, sub: "Total reported" },
    { title: "Resolved", value: stats.resolved, sub: "Closed issues" },
    { title: "Pending", value: stats.pending, sub: "Awaiting action" },
    { title: "Points Earned", value: points, sub: getLevel(points) },
  ];

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/user" },
    { name: "My Issues", icon: Clock3, path: "/user/my-issues" },
    { name: "File New Issue", icon: FilePlus2, path: "/user/report" },
    { name: "Points & Rewards", icon: Gift, path: "/user/rewards" },
    { name: "Profile", icon: User, path: "/user/profile" },
    { name: "Settings", icon: Settings, path: "/user/settings" },
  ];

  const badge = (status) => {
    const s = status.toLowerCase();
    if (s === "resolved") return "bg-emerald-500/20 text-emerald-200";
    if (s === "in-progress") return "bg-sky-500/20 text-sky-200";
    return "bg-amber-500/20 text-amber-200";
  };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const recentIssues = userIssues.slice(0, 4);

  // Category counts from real issues
  const categoryCounts = userIssues.reduce((acc, issue) => {
    const cat = issue.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Issue tracker percentages
  const total = stats.totalIssues || 1;
  const trackerBars = [
    { label: "Filed", pct: 100, color: "bg-violet-300" },
    { label: "In Progress", pct: Math.round((stats.inProgress / total) * 100), color: "bg-amber-300" },
    { label: "Resolved", pct: Math.round((stats.resolved / total) * 100), color: "bg-emerald-300" },
    { label: "Pending", pct: Math.round((stats.pending / total) * 100), color: "bg-rose-300" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-sm">J</div>
          <h1 className="mt-3 font-bold text-lg">JanSevak</h1>
          <p className="text-xs text-slate-400">Community Issue Portal</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                  location.pathname === item.path ? "bg-white/15 text-white font-medium" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 flex gap-3 items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name || "—"}</p>
            <p className="text-xs text-slate-400">Reporter</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{greeting()}, {user?.name?.split(" ")[0] || "—"}</h2>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex gap-3 items-center">
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition">
              <Bell size={16} />
            </button>
            <button
              onClick={() => navigate("/user/report")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center gap-2 text-sm font-medium hover:opacity-90 transition"
            >
              <Plus size={15} /> File New Issue
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-slate-400 mb-3">{card.sub}</p>
                <h3 className="text-3xl font-bold">{loading ? "—" : card.value}</h3>
                <p className="text-sm text-slate-300 mt-1">{card.title}</p>
              </div>
            ))}
          </section>

          {/* Row 2 */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Issues */}
            <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm">Recent Issues</h3>
                <button onClick={() => navigate("/user/my-issues")} className="text-xs text-violet-300 hover:text-violet-200 transition">See all →</button>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-slate-400 text-sm">Loading...</p>
                ) : recentIssues.length > 0 ? (
                  recentIssues.map((issue, i) => {
                    const status = issue.status ? issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : "Pending";
                    return (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{issue.title || issue.category}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{issue.category} • {new Date(issue.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${badge(status)}`}>{status}</span>
                        <span className="px-2 py-1 bg-fuchsia-500/20 text-fuchsia-200 rounded-lg text-xs flex-shrink-0">+10 pts</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-sm">No issues yet. Start by filing one.</p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm">Your Points</h3>
                  <button onClick={() => navigate("/user/rewards")} className="text-xs text-violet-300 hover:text-violet-200 transition">Rewards →</button>
                </div>
                <div className="bg-white/5 rounded-xl p-5 text-center">
                  <h2 className="text-4xl font-bold">{loading ? "—" : points}</h2>
                  <p className="text-xs text-slate-400 mt-1">{getLevel(points)}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-3">Your Categories</h3>
                {topCategories.length > 0 ? (
                  <div className="space-y-2">
                    {topCategories.map(([cat, count], i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2 text-sm">
                        <span className="text-slate-300">{cat}</span>
                        <span className="text-slate-400 text-xs">{count} issue{count > 1 ? "s" : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">No issues filed yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Bottom Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold text-sm mb-4">Issue Tracker</h3>
              {trackerBars.map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="font-semibold text-sm mb-4">Points Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Issues filed", pts: stats.totalIssues * 10, desc: `${stats.totalIssues} × 10 pts` },
                  { label: "Issues resolved", pts: stats.resolved * 20, desc: `${stats.resolved} × 20 pts bonus` },
                  { label: "Total earned", pts: points, desc: "Your current balance" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{row.label}</p>
                      <p className="text-xs text-slate-400">{row.desc}</p>
                    </div>
                    <span className="text-fuchsia-300 text-sm font-semibold">{loading ? "—" : `+${row.pts}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}