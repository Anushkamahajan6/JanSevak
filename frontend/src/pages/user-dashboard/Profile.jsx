import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, FileText, Save, Pencil } from "lucide-react";
import { useUser } from "../../context/userContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [stats, setStats] = useState({ totalIssues: 0, resolved: 0 });

  const apiBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name || "", phone: user.phone || "" });

    fetch(`${apiBase}/api/user/dashboard`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setStats({ totalIssues: d.totalIssues || 0, resolved: d.resolved || 0 }))
      .catch(() => {});
  }, [user]);

  const points = stats.totalIssues * 10 + stats.resolved * 20;

  const getLevel = (pts) => {
    if (pts >= 500) return { label: "Level 4 — Community Leader", color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/20" };
    if (pts >= 300) return { label: "Level 3 — Civic Champion", color: "text-amber-300 bg-amber-500/15 border-amber-500/20" };
    if (pts >= 100) return { label: "Level 2 — Active Reporter", color: "text-sky-300 bg-sky-500/15 border-sky-500/20" };
    return { label: "Level 1 — New Reporter", color: "text-violet-300 bg-violet-500/15 border-violet-500/20" };
  };

  const level = getLevel(points);

  const initials = form.name
    ? form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name cannot be empty"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to save"); return; }
      setUser(prev => ({ ...prev, name: data.name, phone: data.phone }));
      setEditing(false);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const achievements = [
    stats.totalIssues >= 1 && { label: "First Report", desc: "Filed your first issue", color: "bg-violet-500/15 border-violet-500/20" },
    stats.totalIssues >= 5 && { label: "Active Reporter", desc: "Filed 5+ issues", color: "bg-sky-500/15 border-sky-500/20" },
    stats.resolved >= 1 && { label: "Issue Resolved", desc: "One of your issues was resolved", color: "bg-emerald-500/15 border-emerald-500/20" },
    points >= 100 && { label: "100+ Points", desc: "Crossed 100 points", color: "bg-amber-500/15 border-amber-500/20" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/user")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 space-y-7">
          {/* Header */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{form.name || "—"}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className={`mt-2 inline-block text-xs font-medium px-3 py-1 rounded-full border ${level.color}`}>
                {level.label}
              </span>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm hover:bg-white/15 transition flex-shrink-0"
              >
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setEditing(false); setForm({ name: user?.name || "", phone: user?.phone || "" }); setError(""); }}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm hover:bg-white/15 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  <Save size={14} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
          )}

          {/* Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><Mail size={13} /> Email</div>
              <p className="text-sm font-medium">{user?.email || "—"}</p>
              <p className="text-xs text-slate-500 mt-1">Cannot be changed</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><Phone size={13} /> Phone</div>
              {editing ? (
                <input
                  type="text"
                  value={form.phone}
                  placeholder="e.g. +91 9876543210"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500/50 transition"
                />
              ) : (
                <p className="text-sm font-medium">{form.phone || <span className="text-slate-500">Not set</span>}</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">Name</div>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500/50 transition"
                />
              ) : (
                <p className="text-sm font-medium">{form.name || "—"}</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2"><FileText size={13} /> Reports</div>
              <p className="text-sm font-medium">{stats.totalIssues} issue{stats.totalIssues !== 1 ? "s" : ""} filed</p>
              <p className="text-xs text-slate-500 mt-1">{stats.resolved} resolved</p>
            </div>
          </div>

          {/* Points */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Points — {points} total</h3>
              <button onClick={() => navigate("/user/rewards")} className="text-xs text-violet-300 hover:text-violet-200 transition">View rewards →</button>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all" style={{ width: `${Math.min((points / 500) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{Math.max(500 - points, 0)} pts to next level</p>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.map((a, i) => (
                  <div key={i} className={`border rounded-xl p-3 ${a.color}`}>
                    <p className="text-xs font-semibold">{a.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}