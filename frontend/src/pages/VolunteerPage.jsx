import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import {
  LayoutDashboard, Map, ClipboardList, Trophy, Settings,
  LogOut, Bell, CheckCircle, AlertTriangle, ExternalLink
} from "lucide-react";
import HeatmapView from "../components/HeatmapView";
import { useIssueNotifications } from "../hooks/useIssueNotifications";

const DIRECT_CATEGORIES = [
  "Garbage & Waste", "Road Damage", "Stray Animals", "Tree Fallen",
  "Public Property Damage", "Cleanliness", "Waterlogging", "Other",
];

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { user, setUser, loading: userLoading } = useUser();

  const [profileLoading, setProfileLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [volunteer, setVolunteer] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [notification, setNotification] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Profile setup form
  const [formData, setFormData] = useState({ name: "", type: "Individual", ngoName: "" });
  const [formError, setFormError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE_URL;
  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  // Redirect if not volunteer
  useEffect(() => {
    if (!userLoading && (!user || user.role !== "volunteer")) {
      navigate("/login?role=volunteer");
    }
  }, [user, userLoading]);

  // Fetch volunteer profile
  useEffect(() => {
    if (!user || user.role !== "volunteer") return;
    fetch(`${apiBase}/api/volunteer/profile`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.volunteer) {
          setVolunteer(d.volunteer);
          setIsRegistered(true);
          setIsActive(Boolean(d.volunteer.isActive));
        }
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, [user]);

  // Fetch tasks once registered
  useEffect(() => {
    if (!isRegistered) return;
    fetch(`${apiBase}/api/volunteer/tasks`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setAllTasks(d.tasks || []))
      .catch(console.error)
      .finally(() => setTasksLoading(false));
  }, [isRegistered]);

  // Socket notifications
  const handleNewIssue = useCallback((data) => {
    setNotification({ title: data.title || data.category, message: `New ${data.category} issue reported` });
    setTimeout(() => setNotification(null), 6000);
    // Append new task to list immediately
    setAllTasks(prev => {
      const exists = prev.some(t => t.reportId?.toString() === data.issueId?.toString());
      if (exists) return prev;
      return [{
        reportId: data.issueId,
        category: data.category,
        description: data.description || '',
        address: data.location?.address || 'Location on map',
        severity: data.severity,
        pointsReward: (data.severity || 3) * 20,
      }, ...prev];
    });
  }, []);

  const handleTaskAssigned = useCallback((data) => {
    setNotification({ title: 'Task Assigned', message: data.message });
    setTimeout(() => setNotification(null), 8000);
  }, []);

  useIssueNotifications({
    onNewIssue: isActive ? handleNewIssue : null,
    onTaskAssigned: handleTaskAssigned,
    volunteer,
    isActive,
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await fetch(`${apiBase}/api/volunteer/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Profile setup failed"); return; }
      setVolunteer(data.volunteer);
      setIsRegistered(true);
      setIsActive(false);
    } catch {
      setFormError("Server error. Try again.");
    }
  };

  const handleApply = async (taskId) => {
    try {
      const res = await fetch(`${apiBase}/api/volunteer/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ volunteerId: volunteer?._id, taskId }),
      });
      const data = await res.json();
      alert(data.message || "Applied successfully");
    } catch {
      alert("Server error");
    }
  };

  const handleEscalate = (task) => {
    const subject = encodeURIComponent(`Civic Issue: ${task.category}`);
    const body = encodeURIComponent(
      `Issue: ${task.category}\nDescription: ${task.description}\nLocation: ${task.address}\n\nThis issue has been reported by citizens and requires authority attention.`
    );
    window.open(`mailto:authority@example.com?subject=${subject}&body=${body}`, "_blank");
  };

  const toggleStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/volunteer/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsActive(!isActive);
        setVolunteer(data.volunteer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    navigate("/");
  };

  // Split tasks
  const directTasks = allTasks.filter(t => DIRECT_CATEGORIES.includes(t.category));
  const escalateTasks = allTasks.filter(t => !DIRECT_CATEGORIES.includes(t.category));

  const initials = volunteer?.name
    ? volunteer.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.name?.charAt(0)?.toUpperCase() || "V";

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "heatmap", label: "Heatmap", icon: Map },
    { key: "tasks", label: "Tasks", icon: ClipboardList },
    { key: "rewards", label: "Rewards", icon: Trophy },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  // Loading
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Profile setup (first time)
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-sm mb-5">J</div>
          <h1 className="text-xl font-bold mb-1">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm mb-6">One-time setup to get you started as a volunteer.</p>

          {formError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{formError}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                required type="text" placeholder="Your full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Volunteer Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
              >
                <option value="Individual" className="bg-slate-900">Individual Citizen</option>
                <option value="NGO_Affiliated" className="bg-slate-900">NGO Affiliated</option>
              </select>
            </div>
            {formData.type === "NGO_Affiliated" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">NGO Name</label>
                <input
                  required type="text" placeholder="Organisation name"
                  value={formData.ngoName}
                  onChange={e => setFormData({ ...formData, ngoName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/50 transition"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold hover:opacity-90 transition mt-2"
            >
              Save and Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex text-white">

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-5 py-4 rounded-2xl shadow-xl max-w-xs">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-xs opacity-90 mt-1">{notification.message}</p>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-sm">J</div>
          <h1 className="mt-3 font-bold text-lg">JanSevak</h1>
          <p className="text-xs text-slate-400">Volunteer Hub</p>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${activeTab === item.key
                    ? "bg-white/15 text-white font-medium"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{volunteer?.name || "—"}</p>
              <p className="text-xs text-slate-400">{isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Welcome, {volunteer?.name?.split(" ")[0] || "—"}</h2>
            <p className="text-xs text-slate-400">
              {volunteer?.type === "NGO_Affiliated" ? `Representing ${volunteer?.ngoName}` : "Individual Volunteer"}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15 transition">
              <Bell size={16} />
            </button>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-sm font-semibold">
              {volunteer?.points || 0} pts
            </div>
            <button
              onClick={toggleStatus}
              disabled={statusLoading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 border ${isActive
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                  : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/15"
                }`}
            >
              {isActive ? "Active" : "Go Active"}
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">

          {/* Stats — always visible */}
          <section className="grid grid-cols-3 gap-4">
            {[
              { label: "Direct Tasks", value: tasksLoading ? "—" : directTasks.length, sub: "Volunteer can resolve" },
              { label: "Escalate Tasks", value: tasksLoading ? "—" : escalateTasks.length, sub: "Needs authority" },
              { label: "Points Earned", value: volunteer?.points || 0, sub: "Completed tasks" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-3xl font-bold">{s.value}</h3>
                <p className="text-sm text-slate-300 mt-1">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </section>

          {/* Dashboard tab */}
          {activeTab === "dashboard" && (
            <>
              {hasMapboxToken && (
                <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="font-semibold text-sm mb-4">Live Issue Heatmap</h3>
                  <div className="rounded-xl overflow-hidden"><HeatmapView volunteer={volunteer} /></div>
                </section>
              )}

              <TaskSection
                title="Direct Action Tasks"
                subtitle="Volunteer can resolve without authority"
                tasks={directTasks.slice(0, 3)}
                loading={tasksLoading}
                type="direct"
                onApply={handleApply}
                onEscalate={handleEscalate}
                onSeeAll={() => setActiveTab("tasks")}
              />
            </>
          )}

          {/* Heatmap tab */}
          {activeTab === "heatmap" && (
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-4">Live Issue Heatmap</h3>
              {hasMapboxToken
                ? <div className="rounded-xl overflow-hidden"><HeatmapView /></div>
                : <p className="text-slate-500 text-sm text-center py-10">Map token not configured. Add VITE_MAPBOX_TOKEN to your .env</p>
              }
            </section>
          )}

          {/* Tasks tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              <TaskSection
                title="Direct Action Tasks"
                subtitle="You can resolve these yourself — clean up, remove, fix"
                tasks={directTasks}
                loading={tasksLoading}
                type="direct"
                onApply={handleApply}
                onEscalate={handleEscalate}
              />
              <TaskSection
                title="Authority Escalation Tasks"
                subtitle="These require govt / organisation intervention — follow up and raise complaint"
                tasks={escalateTasks}
                loading={tasksLoading}
                type="escalate"
                onApply={handleApply}
                onEscalate={handleEscalate}
              />
            </div>
          )}

          {/* Rewards tab */}
          {activeTab === "rewards" && (
            <RewardsTab volunteer={volunteer} directTasks={directTasks} escalateTasks={escalateTasks} />
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <SettingsTab volunteer={volunteer} setVolunteer={setVolunteer} apiBase={apiBase} handleLogout={handleLogout} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Task Section ---------- */
function TaskSection({ title, subtitle, tasks, loading, type, onApply, onEscalate, onSeeAll }) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {type === "direct"
              ? <CheckCircle size={15} className="text-emerald-400" />
              : <AlertTriangle size={15} className="text-amber-400" />
            }
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-xs text-violet-300 hover:text-violet-200 transition">See all →</button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div key={i} className={`border rounded-xl p-4 ${type === "direct"
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-amber-500/5 border-amber-500/15"
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{task.category}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type === "direct"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                      }`}>
                      {type === "direct" ? "Direct" : "Escalate"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{task.address}</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                  <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full">
                    +{task.pointsReward} pts
                  </span>
                  {type === "direct" ? (
                    <button
                      onClick={() => onApply(task.reportId)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-xs font-semibold hover:opacity-90 transition"
                    >
                      Help Now
                    </button>
                  ) : (
                    <button
                      onClick={() => onEscalate(task)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition"
                    >
                      <ExternalLink size={11} /> Raise Complaint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No tasks in this category right now.</p>
      )}
    </section>
  );
}

/* ---------- Rewards Tab ---------- */
function RewardsTab({ volunteer, directTasks, escalateTasks }) {
  const pts = volunteer?.points || 0;
  const TIERS = [
    { label: "Level 1 — New Volunteer", min: 0, max: 99 },
    { label: "Level 2 — Active Volunteer", min: 100, max: 299 },
    { label: "Level 3 — Community Helper", min: 300, max: 499 },
    { label: "Level 4 — Community Champion", min: 500, max: Infinity },
  ];
  const current = TIERS.findLast(t => pts >= t.min) || TIERS[0];
  const next = TIERS.find(t => t.min > pts);
  const pct = next ? Math.round(((pts - current.min) / (next.min - current.min)) * 100) : 100;

  const history = volunteer?.history || [];
  const completed = history.filter(h => h.status === "Completed").length;

  const badges = [
    history.length >= 1 && { label: "First Task Applied", color: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
    completed >= 1 && { label: "First Completion", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    pts >= 100 && { label: "100 Points", color: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    pts >= 300 && { label: "300 Points", color: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300" },
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-2xl p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Points</p>
            <h2 className="text-5xl font-bold">{pts}</h2>
          </div>
          <p className="text-sm text-violet-300 font-semibold">{current.label}</p>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        {next && <p className="text-xs text-slate-400 mt-2">{next.min - pts} pts to {next.label}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tasks Applied", value: history.length },
          { label: "Completed", value: completed },
          { label: "Badges", value: badges.length },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-3">All Levels</h3>
        <div className="space-y-2">
          {TIERS.map((tier, i) => (
            <div key={i} className={`flex justify-between items-center rounded-xl px-4 py-3 border text-sm ${current.label === tier.label ? "bg-violet-500/15 border-violet-500/30 text-white" : "bg-white/5 border-white/10 text-slate-400"
              }`}>
              <span>{tier.label}</span>
              <span className="text-xs">{tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}</span>
            </div>
          ))}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Earned Badges</h3>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b, i) => (
              <div key={i} className={`border rounded-xl px-4 py-3 text-xs font-medium ${b.color}`}>{b.label}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Settings Tab ---------- */
function SettingsTab({ volunteer, setVolunteer, apiBase, handleLogout }) {
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("volSettings") || "{}");
    if (s.notifications !== undefined) setNotifications(s.notifications);
    if (s.locationAccess !== undefined) setLocationAccess(s.locationAccess);
  }, []);

  const handleSave = () => {
    localStorage.setItem("volSettings", JSON.stringify({ notifications, locationAccess }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onClick }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-white/20"}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-7" : "left-1"}`} />
    </button>
  );

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4">Profile</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
            <span className="text-slate-400">Name</span>
            <span>{volunteer?.name || "—"}</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3">
            <span className="text-slate-400">Type</span>
            <span>{volunteer?.type === "NGO_Affiliated" ? `NGO — ${volunteer.ngoName}` : "Individual"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold mb-1">Preferences</h3>
        {[
          { label: "Notifications", sub: "New issue alerts", value: notifications, set: setNotifications },
          { label: "Location Access", sub: "Required for nearby tasks", value: locationAccess, set: setLocationAccess },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
            <Toggle value={item.value} onClick={() => item.set(!item.value)} />
          </div>
        ))}
        <button
          onClick={handleSave}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${saved ? "bg-emerald-500/80" : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-90"}`}
        >
          {saved ? "Saved" : "Save Preferences"}
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm font-medium hover:bg-red-500/20 transition"
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  );
}