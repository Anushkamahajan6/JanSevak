import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import HeatmapView from "../components/HeatmapView";
import { updateVolunteerStatus } from "../api/volunteerApi";
import { useIssueNotifications } from "../hooks/useIssueNotifications";

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [notificationTimeout, setNotificationTimeout] = useState(null);

  const [formData, setFormData] = useState({ name: "", type: "Individual", ngoName: "" });

  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  // Redirect if not logged in as volunteer
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        navigate("/login?role=volunteer");
      } else if (user.role !== "volunteer") {
        navigate("/login?role=volunteer");
      }
    }
  }, [user, userLoading, navigate]);

  // Check if volunteer profile already exists
  useEffect(() => {
    if (!user || user.role !== "volunteer") return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/volunteer/profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.volunteer) {
            setCurrentUser(data.volunteer);
            setIsRegistered(true);
            setIsActive(Boolean(data.volunteer.isActive));
          }
        }
      } catch (err) {
        console.error("Error fetching volunteer profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch tasks once registered
  useEffect(() => {
    if (!isRegistered) return;
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/volunteer/tasks", {
          credentials: "include",
        });
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [isRegistered]);

  const handleNewIssue = (issueData) => {
    setNotification({
      title: issueData.title || issueData.category,
      message: `New ${issueData.category} issue reported`,
      data: issueData,
    });
    if (notificationTimeout) clearTimeout(notificationTimeout);
    const t = setTimeout(() => setNotification(null), 8000);
    setNotificationTimeout(t);
  };

  useIssueNotifications(isActive ? handleNewIssue : null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.volunteer || null);
        setIsRegistered(true);
        setIsActive(Boolean(data.volunteer?.isActive));
      } else {
        alert(data.error || "Profile setup failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleApply = async (taskId) => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ volunteerId: currentUser?._id, taskId }),
      });
      const data = await res.json();
      alert(data.message || "Applied successfully");
    } catch (err) {
      alert("Server error");
    }
  };

  const toggleVolunteerStatus = async () => {
    try {
      const data = await updateVolunteerStatus(currentUser?._id, !isActive);
      setIsActive(!isActive);
      alert(data.message || "Status updated");
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  // Loading states
  if (userLoading || profileLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loader} />
        <p style={{ marginTop: "16px", color: "#fff", fontSize: "14px" }}>Loading...</p>
      </div>
    );
  }

  // Profile setup (first time only)
  if (!isRegistered) {
    return (
      <div style={styles.bg}>
        <div style={styles.overlay} />
        <div style={styles.centerWrap}>
          <div style={styles.glassCard}>
            <h1 style={styles.title}>Complete Your Profile</h1>
            <p style={styles.subtitle}>This is a one-time setup to get you started as a volunteer.</p>

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Volunteer Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={styles.input}
                >
                  <option value="Individual">Individual Citizen</option>
                  <option value="NGO_Affiliated">NGO Affiliated</option>
                </select>
              </div>

              {formData.type === "NGO_Affiliated" && (
                <div>
                  <label style={styles.label}>NGO Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter NGO Name"
                    value={formData.ngoName}
                    onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                    style={styles.input}
                  />
                </div>
              )}

              <button type="submit" style={styles.btn}>Save and Continue</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={styles.bg}>
      <div style={styles.overlay} />

      {notification && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
          padding: "16px 24px", borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(239,68,68,0.4)",
          fontSize: "14px", fontWeight: "600",
          display: "flex", flexDirection: "column", gap: "8px", maxWidth: "320px",
        }}>
          <div style={{ fontSize: "16px", fontWeight: "700" }}>{notification.title}</div>
          <div style={{ fontSize: "13px", opacity: 0.9 }}>{notification.message}</div>
        </div>
      )}

      <div style={styles.dashboard}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div>
            <div style={styles.brandBox}>
              <div style={styles.iconCircleSmall}>J</div>
              <div>
                <div style={styles.brandTitle}>JanSevak</div>
                <div style={styles.brandSub}>Volunteer Hub</div>
              </div>
            </div>
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "heatmap", label: "Heatmap" },
              { key: "tasks", label: "Tasks" },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={activeTab === item.key ? styles.menuActive : styles.menu}
              >
                {item.label}
              </div>
            ))}
            <div style={styles.menu}>Rewards</div>
            <div style={styles.menu}>Settings</div>
          </div>

          <div style={styles.profileMini}>
            <div style={styles.avatar}>{currentUser?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{currentUser?.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>{isActive ? "Active" : "Inactive"}</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={styles.main}>
          <div style={styles.topbar}>
            <div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Welcome, {currentUser?.name}</h2>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
                {currentUser?.type === "NGO_Affiliated" ? `Representing ${currentUser?.ngoName}` : "Individual Volunteer"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={toggleVolunteerStatus}
                style={{
                  ...styles.statusBtn,
                  background: isActive ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#6b7280,#4b5563)",
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </button>
              <div style={styles.pointsBox}>{currentUser?.points || 0} pts</div>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {[
              { label: "Nearby Tasks", value: tasks.length },
              { label: "Total Points", value: currentUser?.points || 0 },
              { label: "Status", value: isActive ? "Live" : "Paused" },
            ].map((s, i) => (
              <div key={i} style={styles.statGlass}>
                <h3 style={{ margin: "0 0 6px", fontSize: "28px" }}>{s.value}</h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {(activeTab === "dashboard" || activeTab === "heatmap") && (
            <div style={styles.sectionGlass}>
              <h3 style={styles.sectionHeading}>Live Issue Heatmap</h3>
              <div style={{ borderRadius: "14px", overflow: "hidden" }}>
                {hasMapboxToken ? <HeatmapView /> : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                    Map token not configured
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === "dashboard" || activeTab === "tasks") && (
            <div style={styles.sectionGlass}>
              <h3 style={styles.sectionHeading}>Nearby Tasks</h3>
              {loading ? (
                <p style={{ color: "#64748b", fontSize: "14px" }}>Loading tasks...</p>
              ) : tasks.length > 0 ? (
                <div style={styles.taskGrid}>
                  {tasks.map((task, i) => (
                    <div key={i} style={styles.taskCard}>
                      <div style={styles.taskTop}>
                        <h4 style={{ margin: 0, fontSize: "15px" }}>{task.category}</h4>
                        <span style={styles.reward}>+{task.pointsReward} pts</span>
                      </div>
                      <p style={styles.taskDesc}>{task.description}</p>
                      <div style={styles.taskBottom}>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>{task.address}</span>
                        <button onClick={() => handleApply(task.reportId)} style={styles.btnSmall}>
                          Help Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: "14px" }}>No tasks available at the moment.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)", position: "relative", fontFamily: "inherit" },
  overlay: { position: "absolute", inset: 0 },
  centerWrap: { position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" },
  glassCard: { width: "100%", maxWidth: "480px", padding: "40px", borderRadius: "24px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" },
  title: { margin: "0 0 8px", fontSize: "26px", fontWeight: "700" },
  subtitle: { color: "#94a3b8", marginBottom: "28px", fontSize: "14px" },
  label: { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#e2e8f0" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: "14px", outline: "none" },
  btn: { padding: "13px", border: "none", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "15px", marginTop: "8px" },
  loadingPage: { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#312e81)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  loader: { width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.2)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  dashboard: { position: "relative", zIndex: 2, display: "flex", minHeight: "100vh", padding: "18px", gap: "18px" },
  sidebar: { width: "230px", borderRadius: "20px", padding: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", flexShrink: 0 },
  brandBox: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px" },
  iconCircleSmall: { width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "700" },
  brandTitle: { fontWeight: "700", fontSize: "15px" },
  brandSub: { fontSize: "11px", color: "#94a3b8" },
  menu: { padding: "11px 14px", borderRadius: "10px", marginBottom: "4px", cursor: "pointer", color: "#94a3b8", fontSize: "14px", transition: "all 0.2s" },
  menuActive: { padding: "11px 14px", borderRadius: "10px", marginBottom: "4px", background: "rgba(255,255,255,0.12)", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#fff" },
  profileMini: { display: "flex", gap: "10px", alignItems: "center", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  main: { flex: 1, display: "flex", flexDirection: "column", gap: "16px" },
  topbar: { padding: "18px 22px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  statusBtn: { padding: "10px 16px", border: "none", borderRadius: "10px", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  pointsBox: { padding: "10px 16px", borderRadius: "10px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", fontWeight: "700", fontSize: "13px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px" },
  statGlass: { padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" },
  sectionGlass: { padding: "20px", borderRadius: "20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" },
  sectionHeading: { marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "600" },
  taskGrid: { display: "grid", gap: "14px" },
  taskCard: { padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" },
  taskTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  reward: { padding: "5px 10px", borderRadius: "20px", background: "linear-gradient(135deg,#22c55e,#16a34a)", fontSize: "12px", fontWeight: "700" },
  taskDesc: { marginTop: "8px", color: "#94a3b8", fontSize: "13px" },
  taskBottom: { marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" },
  btnSmall: { padding: "8px 14px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg,#8b5cf6,#6366f1)", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};