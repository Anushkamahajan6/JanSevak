import { useState, useEffect } from "react";
import HeatmapView from "../Components/heatmapview";

export default function VolunteerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Individual",
    ngoName: "",
  });

<<<<<<< HEAD
  // Lead Feature State
  const [additionalCount, setAdditionalCount] = useState(1);

  // 1. Fetch tasks on load
=======
>>>>>>> 021d16bbf91163a4c3568aaf78556b58e60f48d0
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/volunteer/tasks");
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.volunteer);
        setIsRegistered(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // "I want to help" from task card — uses express-interest endpoint
  const handleApply = async (issueId) => {
    if (!currentUser?._id) return alert("Please register first.");
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/express-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: currentUser._id, issueId }),
      });
      const data = await res.json();
      alert(data.message || data.error);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

<<<<<<< HEAD
  // 4. Handle "I need more people" (Lead Feature)
  const handleRequestMore = async (taskId) => {
    if (!taskId) {
        alert("Please enter a valid Task ID first!");
        return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/volunteer/request-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskId,
          additionalCount: parseInt(additionalCount)
        })
      });
      const data = await response.json();
      alert(data.message || data.error);
    } catch (error) {
      console.error("Error requesting more people:", error);
    }
  };

  // --- UI: REGISTRATION SCREEN ---
  if (!isRegistered) {
=======
  const toggleVolunteerStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: currentUser?._id, isActive: !isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsActive(!isActive);
        alert(data.message || "Status updated");
      } else {
        alert(data.error || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (loading) {
>>>>>>> 021d16bbf91163a4c3568aaf78556b58e60f48d0
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p style={{ marginTop: "16px", color: "#fff" }}>Loading...</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div style={styles.bg}>
        <div style={styles.overlay}></div>
        <div style={styles.centerWrap}>
          <div style={styles.glassCard}>
            <div style={styles.iconCircle}>🤝</div>
            <h1 style={styles.title}>Join as Volunteer</h1>
            <p style={styles.subtitle}>Become a part of positive change in your city.</p>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input required type="text" placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Volunteer Type</label>
                <select value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={styles.input}>
                  <option value="Individual">Individual Citizen</option>
                  <option value="NGO_Affiliated">NGO Affiliated</option>
                </select>
              </div>
              {formData.type === "NGO_Affiliated" && (
                <div>
                  <label style={styles.label}>NGO Name</label>
                  <input required type="text" placeholder="Enter NGO Name"
                    value={formData.ngoName}
                    onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                    style={styles.input} />
                </div>
              )}
              <button type="submit" style={styles.btn}>Start Volunteering →</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.overlay}></div>
      <div style={styles.dashboard}>

<<<<<<< HEAD
      {/* --- NEW: LEAD CONTROL PANEL (For Hackathon Demo) --- */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👑 Lead Control Panel
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#92400e' }}>
          If you were assigned as the Primary Lead for a task, you can request backup from the waitlist here:
        </p>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Paste Task ID here..." 
            id="demoTaskId"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d97706', flex: 1 }}
          />
          <input 
            type="number" 
            min="1" max="10" 
            value={additionalCount}
            onChange={(e) => setAdditionalCount(e.target.value)}
            style={{ padding: '10px', width: '80px', borderRadius: '6px', border: '1px solid #d97706' }}
          />
          <button 
            onClick={() => handleRequestMore(document.getElementById('demoTaskId').value)}
            style={{ backgroundColor: '#f59e0b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Request Backup
          </button>
        </div>
      </div>

      {/* Heatmap Section (Point 2) */}
      <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>Live Issue Heatmap</h2>
      <div style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
         <HeatmapView /> 
      </div>

      {/* Task List Section */}
      <h2 style={{ color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Nearby Tasks</h2>
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {tasks.map((task, index) => (
          <div key={index} style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px', backgroundColor: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{task.category}</h3>
              <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                +{task.pointsReward} pts
              </span>
=======
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div>
            <div style={styles.brandBox}>
              <div style={styles.iconCircleSmall}>🤝</div>
              <div>
                <div style={styles.brandTitle}>JanSevak</div>
                <div style={styles.brandSub}>Volunteer Hub</div>
              </div>
>>>>>>> 021d16bbf91163a4c3568aaf78556b58e60f48d0
            </div>
            <div style={styles.menuActive}>🏠 Dashboard</div>
            <div style={styles.menu}>🗺️ Heatmap</div>
            <div style={styles.menu}>📌 Tasks</div>
            <div style={styles.menu}>🏆 Rewards</div>
            <div style={styles.menu}>⚙️ Settings</div>
          </div>
          <div style={styles.profileMini}>
            <div style={styles.avatar}>{currentUser.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: "600" }}>{currentUser.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>Volunteer</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={styles.main}>

          {/* Topbar */}
          <div style={styles.topbar}>
            <div>
              <h2 style={{ margin: 0, color: "#fff" }}>Welcome, {currentUser.name}</h2>
              <p style={{ margin: "4px 0 0", color: "#ddd" }}>
                {currentUser.type === "NGO_Affiliated" ? `Representing ${currentUser.ngoName}` : "Individual Volunteer"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button onClick={toggleVolunteerStatus}
                style={isActive ? styles.activeStatusBtn : styles.inactiveStatusBtn}>
                {isActive ? "🟢 Active Now" : "🔴 Go Active"}
              </button>
              <div style={styles.pointsBadge}>🏆 {currentUser?.points || 0} Points</div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statGlass}><h3>{tasks.length}</h3><p>Open Issues</p></div>
            <div style={styles.statGlass}><h3>{currentUser.points}</h3><p>Total Points</p></div>
            <div style={styles.statGlass}><h3>Live</h3><p>Heatmap Status</p></div>
          </div>

          {/* ✅ Heatmap — pass currentUser so "I Can Help" knows the volunteerId */}
          <div style={styles.sectionGlass}>
            <h3 style={styles.sectionHeading}>📍 Live Issue Heatmap</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '-12px', marginBottom: '14px' }}>
              Click any red pin to see issue details and volunteer.
            </p>
            <div style={{ borderRadius: "14px", overflow: "hidden", height: "400px" }}>
              <HeatmapView currentUser={currentUser} />
            </div>
          </div>

          {/* Tasks from real DB */}
          <div style={styles.sectionGlass}>
            <h3 style={styles.sectionHeading}>🚀 Open Issues Near You</h3>
            {tasks.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No open issues right now. Check back later!</p>
            ) : (
              <div style={styles.taskGrid}>
                {tasks.map((task, index) => (
                  <div key={index} style={styles.taskCard}>
                    <div style={styles.taskTop}>
                      <h4 style={{ margin: 0 }}>{task.category}</h4>
                      <span style={styles.reward}>+{task.pointsReward} pts</span>
                    </div>
                    <p style={styles.taskDesc}>{task.description}</p>
                    <div style={styles.taskBottom}>
                      <span style={{ fontSize: "13px" }}>📍 {task.address}</span>
                      <button onClick={() => handleApply(task.reportId)} style={styles.btnSmall}>
                        🙋 I Can Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#312e81,#4c1d95)", position: "relative", overflow: "hidden", fontFamily: "Arial, sans-serif" },
  overlay: { position: "absolute", inset: 0, backdropFilter: "blur(4px)" },
  centerWrap: { position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" },
  glassCard: { width: "100%", maxWidth: "520px", padding: "35px", borderRadius: "24px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", color: "#fff" },
  iconCircle: { width: "65px", height: "65px", borderRadius: "18px", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", marginBottom: "20px" },
  title: { margin: 0, fontSize: "34px", fontWeight: "700" },
  subtitle: { color: "#d1d5db", marginTop: "8px", marginBottom: "25px" },
  label: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" },
  input: { width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", color: "#fff", outline: "none", fontSize: "14px" },
  btn: { marginTop: "8px", padding: "14px", border: "none", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "15px" },
  loadingPage: { minHeight: "100vh", background: "linear-gradient(135deg,#111827,#312e81)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  loader: { width: "50px", height: "50px", border: "4px solid rgba(255,255,255,0.3)", borderTop: "4px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  dashboard: { position: "relative", zIndex: 2, display: "flex", minHeight: "100vh", padding: "18px", gap: "18px" },
  sidebar: { width: "250px", borderRadius: "22px", padding: "20px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" },
  brandBox: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "25px" },
  iconCircleSmall: { width: "46px", height: "46px", borderRadius: "14px", background: "rgba(255,255,255,0.16)", display: "flex", justifyContent: "center", alignItems: "center" },
  brandTitle: { fontWeight: "700", fontSize: "16px" },
  brandSub: { fontSize: "12px", opacity: 0.8 },
  menu: { padding: "12px 14px", borderRadius: "12px", marginBottom: "8px", cursor: "pointer", opacity: 0.9 },
  menuActive: { padding: "12px 14px", borderRadius: "12px", marginBottom: "8px", background: "rgba(255,255,255,0.16)", cursor: "pointer", fontWeight: "700" },
  profileMini: { display: "flex", gap: "12px", alignItems: "center", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.12)" },
  avatar: { width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  main: { flex: 1, display: "flex", flexDirection: "column", gap: "18px" },
  topbar: { padding: "20px", borderRadius: "22px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pointsBadge: { padding: "10px 16px", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: "700", fontSize: "14px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px" },
  statGlass: { padding: "20px", borderRadius: "20px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" },
  sectionGlass: { padding: "20px", borderRadius: "22px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" },
  sectionHeading: { marginTop: 0, marginBottom: "18px" },
  taskGrid: { display: "grid", gap: "16px" },
  taskCard: { padding: "18px", borderRadius: "18px", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)" },
  taskTop: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" },
  reward: { padding: "6px 10px", borderRadius: "30px", background: "linear-gradient(135deg,#22c55e,#16a34a)", fontSize: "12px", fontWeight: "700" },
  taskDesc: { marginTop: "10px", color: "#e5e7eb", fontSize: "14px" },
  taskBottom: { marginTop: "14px", display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  btnSmall: { padding: "10px 14px", border: "none", borderRadius: "10px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", cursor: "pointer", fontWeight: "700" },
  activeStatusBtn: { border: "none", padding: "10px 14px", borderRadius: "10px", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: "700", cursor: "pointer" },
  inactiveStatusBtn: { border: "none", padding: "10px 14px", borderRadius: "10px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: "700", cursor: "pointer" },
};