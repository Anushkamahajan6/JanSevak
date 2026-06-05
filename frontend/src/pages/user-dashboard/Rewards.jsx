import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Star } from "lucide-react";
import { useUser } from "../../context/userContext";

const TIERS = [
  { label: "Level 1 — New Reporter", min: 0, max: 99 },
  { label: "Level 2 — Active Reporter", min: 100, max: 299 },
  { label: "Level 3 — Civic Champion", min: 300, max: 499 },
  { label: "Level 4 — Community Leader", min: 500, max: Infinity },
];

export default function Rewards() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState({ totalIssues: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/dashboard`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setStats({ totalIssues: d.totalIssues || 0, resolved: d.resolved || 0 }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const points = stats.totalIssues * 10 + stats.resolved * 20;
  const currentTier = TIERS.findLast(t => points >= t.min) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > points);
  const progressPct = nextTier ? Math.round(((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100) : 100;

  const breakdown = [
    { label: "Issues filed", pts: stats.totalIssues * 10, detail: `${stats.totalIssues} × 10 pts` },
    { label: "Issues resolved", pts: stats.resolved * 20, detail: `${stats.resolved} × 20 pts bonus` },
  ];

  const badges = [
    stats.totalIssues >= 1 && { label: "First Report", color: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
    stats.totalIssues >= 5 && { label: "5 Reports Filed", color: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
    stats.totalIssues >= 10 && { label: "10 Reports Filed", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300" },
    stats.resolved >= 1 && { label: "Issue Resolved", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    points >= 100 && { label: "100 Points", color: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    points >= 300 && { label: "300 Points", color: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/user")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 space-y-7">
          <div>
            <h1 className="text-xl font-bold">Points & Rewards</h1>
            <p className="text-slate-400 text-sm mt-1">Earn points by reporting and getting issues resolved.</p>
          </div>

          {/* Points card */}
          <div className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-xl p-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Points</p>
                <h2 className="text-5xl font-bold">{loading ? "—" : points}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Current Rank</p>
                <p className="text-sm font-semibold text-violet-300">{currentTier.label}</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            {nextTier && (
              <p className="text-xs text-slate-400 mt-2">{nextTier.min - points} pts to {nextTier.label}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Trophy size={18} />, label: "Issues Filed", value: stats.totalIssues, color: "text-amber-300" },
              { icon: <Medal size={18} />, label: "Resolved", value: stats.resolved, color: "text-emerald-300" },
              { icon: <Star size={18} />, label: "Badges", value: badges.length, color: "text-fuchsia-300" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold">{loading ? "—" : s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Points Breakdown</h3>
            <div className="space-y-2">
              {breakdown.map((row, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{row.label}</p>
                    <p className="text-xs text-slate-400">{row.detail}</p>
                  </div>
                  <span className="text-fuchsia-300 font-semibold text-sm">{loading ? "—" : `+${row.pts}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <h3 className="text-sm font-semibold mb-3">All Levels</h3>
            <div className="space-y-2">
              {TIERS.map((tier, i) => {
                const active = currentTier.label === tier.label;
                return (
                  <div key={i} className={`flex justify-between items-center rounded-xl px-4 py-3 border text-sm transition ${active ? "bg-violet-500/15 border-violet-500/30 text-white" : "bg-white/5 border-white/10 text-slate-400"}`}>
                    <span>{tier.label}</span>
                    <span className="text-xs">{tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Earned Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((b, i) => (
                  <div key={i} className={`border rounded-xl px-4 py-3 text-xs font-medium ${b.color}`}>{b.label}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}