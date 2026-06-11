import React, { useState, useEffect } from "react";
import { Users, RefreshCw, Star, Award } from "lucide-react";
import { fetchAdminVolunteers } from "../../api/adminApi";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const data = await fetchAdminVolunteers();
      setVolunteers(data.volunteers || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "#0f1117", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        .topbar{background:rgba(15,17,23,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.07);}
        .panel{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;}
        .vol-row{border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s;}
        .vol-row:last-child{border-bottom:none;}
        .vol-row:hover{background:rgba(99,102,241,0.05);}
        .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div className="topbar px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-400" />
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
              Volunteers Network
            </h1>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              {volunteers.length} registered
            </p>
          </div>
        </div>
        <button onClick={load} style={{ color: "rgba(255,255,255,0.4)" }} className="hover:text-white transition p-2 rounded-lg hover:bg-white/5">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}
        <div className="panel">
          {loading ? [1, 2, 3].map(i => (
            <div key={i} className="vol-row flex justify-between items-center py-4 px-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-full" style={{ borderRadius: '50%' }} />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-28 sm:w-36" />
                  <div className="skeleton h-3 w-20 sm:w-24" />
                </div>
              </div>
              <div className="skeleton h-6 w-16 sm:w-20 rounded-full" />
            </div>
          )) : volunteers.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No volunteers registered yet</div>
          ) : volunteers.map((vol) => (
            <div key={vol._id} className="vol-row flex justify-between items-center py-4 px-4 sm:px-5 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.25)" }}>
                  {vol.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)" }} className="truncate">{vol.name}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }} className="truncate">
                    {vol.type === 'NGO_Affiliated' ? `NGO — ${vol.ngoName}` : 'Independent'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {vol.points > 0 && (
                  <div className="hidden sm:flex items-center gap-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    <Award size={12} className="text-amber-400" />{vol.points}
                  </div>
                )}
                {vol.rating > 0 && (
                  <div className="hidden sm:flex items-center gap-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    <Star size={12} className="text-yellow-400" />{vol.rating.toFixed(1)}
                  </div>
                )}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px",
                  background: vol.type === 'NGO_Affiliated' ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                  border: vol.type === 'NGO_Affiliated' ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: vol.type === 'NGO_Affiliated' ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                  whiteSpace: "nowrap",
                }}>
                  {vol.type === 'NGO_Affiliated' ? 'NGO' : 'Independent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}