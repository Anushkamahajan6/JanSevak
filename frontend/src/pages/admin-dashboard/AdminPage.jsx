import React, { useState, useEffect } from 'react';
import HeatmapView from '../../Components/HeatmapView';
import { fetchAdminStats, fetchAdminIssues, fetchAdminVolunteers, updateIssueStatus, approveVolunteer } from '../../api/adminApi';
import {
  Rocket, Flame, UserCheck, PawPrint, CheckCircle2,
  X, Activity, ChevronRight, Zap, Loader2,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const DB_TO_UI_STATUS = {
  'open': 'REPORTED',
  'pending': 'REPORTED',
  'in-progress': 'IN PROGRESS',
  'resolved': 'RESOLVED',
};

const statusStyle = {
  REPORTED:    { pill: "bg-amber-500/20 text-amber-400 border border-amber-500/30",   dot: "bg-amber-400" },
  "IN PROGRESS": { pill: "bg-blue-500/20 text-blue-400 border border-blue-500/30",   dot: "bg-blue-400" },
  RESOLVED:    { pill: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [stats, setStats]         = useState(null);
  const [issues, setIssues]       = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [showModal, setShowModal]               = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [deployed, setDeployed]                 = useState(false);
  const [deploying, setDeploying]               = useState(false);

  // Fetch everything on mount
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [statsData, issuesData, volunteersData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminIssues(),
          fetchAdminVolunteers(),
        ]);
        setStats(statsData);
        setIssues(issuesData.issues || []);
        setVolunteers(volunteersData.volunteers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleVolunteer = (id) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // Mark issue resolved
  const handleResolve = async (issueId) => {
    try {
      await updateIssueStatus(issueId, 'resolved');
      setIssues((prev) =>
        prev.map((i) => i._id === issueId ? { ...i, status: 'resolved' } : i)
      );
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  // Deploy selected volunteers (approve for first open issue as demo)
  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const firstOpenIssue = issues.find(i => i.status !== 'resolved');
      if (firstOpenIssue) {
        for (const vId of selectedVolunteers) {
          try {
            await approveVolunteer(firstOpenIssue._id, vId);
          } catch (_) { /* volunteer may not be linked to issue, skip */ }
        }
      }
      // Refresh issues after deploy
      const issuesData = await fetchAdminIssues();
      setIssues(issuesData.issues || []);
    } catch (err) {
      console.error('Deploy error:', err);
    } finally {
      setDeploying(false);
      setShowModal(false);
      setDeployed(true);
    }
  };

  const recentIssues = issues.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "#0f1117", fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s ease; border-radius: 16px; }
        .stat-card:hover { border-color: rgba(99,102,241,0.35); transform: translateY(-2px); background: rgba(255,255,255,0.06); }
        .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
        .report-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; border-radius: 12px; }
        .report-card:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.25); }
        .deploy-btn { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); transition: all 0.2s ease; box-shadow: 0 4px 16px rgba(99,102,241,0.3); }
        .deploy-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.45); }
        .confirm-btn { background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); box-shadow: 0 4px 16px rgba(99,102,241,0.35); transition: all 0.2s; }
        .confirm-btn:hover { transform: translateY(-1px); }
        .pulse-dot { animation: pulse-anim 2s infinite; }
        @keyframes pulse-anim { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .modal-overlay { backdrop-filter: blur(8px); background: rgba(0,0,0,0.65); }
        .modal-box { background: #13141f; border: 1px solid rgba(99,102,241,0.2); box-shadow: 0 25px 60px rgba(0,0,0,0.5); }
        .vol-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); transition: all 0.15s; border-radius: 12px; }
        .vol-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.06); }
        .topbar { background: rgba(15,17,23,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .banner-success { background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.07) 100%); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; }
        .cancel-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); transition: all 0.15s; border-radius: 10px; }
        .cancel-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.75); }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar px-6 py-4 flex justify-between items-center">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot inline-block"></span>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Real-time coordination panel</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="deploy-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
          <Rocket size={15} />
          Deploy Volunteers
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-5 flex-1">

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X size={15} className="text-red-400" />
            <p className="text-sm text-red-300">{error} — Check that backend is running and you're logged in as admin.</p>
          </div>
        )}

        {deployed && (
          <div className="banner-success flex items-center gap-3 px-4 py-3">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <p className="text-sm text-emerald-300 font-medium">
              {selectedVolunteers.length} Volunteer{selectedVolunteers.length !== 1 ? 's' : ''} deployed and notified
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">

          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em" }}>HOTSPOTS</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <Flame size={14} className="text-red-400" />
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-9 w-16 mb-1.5" />
            ) : (
              <h2 style={{ fontSize: "34px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#f87171", lineHeight: 1 }}>
                {stats?.hotspots ?? 0}
              </h2>
            )}
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>Active zones</p>
          </div>

          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em" }}>VOLUNTEERS</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <UserCheck size={14} className="text-emerald-400" />
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-9 w-16 mb-1.5" />
            ) : (
              <h2 style={{ fontSize: "34px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#34d399", lineHeight: 1 }}>
                {stats?.activeVolunteers ?? 0}
              </h2>
            )}
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>Registered</p>
          </div>

          <div className="stat-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em" }}>ANIMAL CASES</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <PawPrint size={14} className="text-indigo-400" />
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-9 w-16 mb-1.5" />
            ) : (
              <h2 style={{ fontSize: "34px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#a5b4fc", lineHeight: 1 }}>
                {stats?.animalCases ?? 0}
              </h2>
            )}
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "6px" }}>Open cases</p>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-4">

          {/* MAP */}
          <div className="col-span-2 panel p-5 flex flex-col" style={{ height: "360px" }}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-indigo-400" />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Live Heatmap</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot inline-block"></span>
                <span style={{ fontSize: "11px", color: "#6ee7b7", fontWeight: 500 }}>Real-time</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden">
              <HeatmapView />
            </div>
          </div>

          {/* RECENT REPORTS */}
          <div className="panel p-5 flex flex-col" style={{ height: "360px" }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-amber-400" />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Recent Reports</h3>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="report-card p-4">
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                ))
              ) : recentIssues.length === 0 ? (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "40px" }}>
                  No issues reported yet
                </p>
              ) : recentIssues.map((issue) => {
                const uiStatus = DB_TO_UI_STATUS[issue.status] || 'REPORTED';
                const s = statusStyle[uiStatus];
                return (
                  <div key={issue._id} className="report-card p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                        {issue.title || issue.category}
                      </p>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 ${s.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${s.dot}`}></span>
                        {uiStatus}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      {issue.category} • {timeAgo(issue.createdAt)}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "5px" }}>
                      📍 {issue.location?.address || 'GPS'} • 👍 {issue.upvotes ?? 0}
                    </p>
                    {issue.status === 'in-progress' && (
                      <button
                        onClick={() => handleResolve(issue._id)}
                        className="flex items-center gap-1 mt-3"
                        style={{ fontSize: "12px", fontWeight: 500, color: "#818cf8" }}
                      >
                        Mark as Resolved <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* DEPLOY MODAL */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-box w-[440px] rounded-2xl p-7">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  Assign Volunteers
                </h2>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>
                  Select volunteers to deploy to active hotspots
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center cancel-btn">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {volunteers.length === 0 ? (
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
                  No volunteers registered yet
                </p>
              ) : volunteers.map((v) => (
                <label key={v._id} className="vol-card flex items-center justify-between px-4 py-3.5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300"
                      style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.25)" }}>
                      {v.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{v.name}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.32)", marginTop: "1px" }}>
                        {v.type === 'NGO_Affiliated' ? v.ngoName : "Independent Volunteer"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px",
                      background: v.type === 'NGO_Affiliated' ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                      border: v.type === 'NGO_Affiliated' ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      color: v.type === 'NGO_Affiliated' ? "#a5b4fc" : "rgba(255,255,255,0.38)",
                    }}>
                      {v.type === 'NGO_Affiliated' ? 'NGO' : 'Independent'}
                    </span>
                    <input type="checkbox" onChange={() => toggleVolunteer(v._id)}
                      className="w-4 h-4 cursor-pointer accent-indigo-500 rounded" />
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm cancel-btn">Cancel</button>
              <button
                onClick={handleDeploy}
                disabled={selectedVolunteers.length === 0 || deploying}
                className="confirm-btn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {deploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                {deploying ? 'Deploying...' : 'Confirm Deployment'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}