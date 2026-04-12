import { useState, useEffect } from "react";
import HeatmapView from "../components/HeatmapView";
import { updateVolunteerStatus } from "../api/volunteerApi";
import { useIssueNotifications, playNotificationSound } from "../hooks/useIssueNotifications";

export default function VolunteerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [notificationTimeout, setNotificationTimeout] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Individual",
    ngoName: "",
  });

  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

  // Initialize Socket.io notification listener
  const handleNewIssue = (issueData) => {
    setNotification({
      type: 'issue',
      title: issueData.title || issueData.category,
      message: `${issueData.urgency === 'HIGH' ? '🚨 HIGH PRIORITY' : '📍'} New ${issueData.category} issue reported`,
      data: issueData
    });

    // Auto-clear after 8 seconds
    if (notificationTimeout) clearTimeout(notificationTimeout);
    const timeout = setTimeout(() => setNotification(null), 8000);
    setNotificationTimeout(timeout);
  };

  useIssueNotifications(isActive ? handleNewIssue : null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/volunteer/tasks");
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "http://localhost:5000/api/volunteer/profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data.volunteer || null);
        setIsRegistered(true);
        setIsActive(Boolean(data.volunteer?.isActive));
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleApply = async (taskId) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/volunteer/apply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteerId: currentUser?._id,
            taskId,
          }),
        }
      );

      const data = await res.json();
      alert(data.message || "Applied successfully");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const toggleVolunteerStatus = async () => {
    try {
      const data = await updateVolunteerStatus(currentUser?._id, !isActive);
      setIsActive(!isActive);
      alert(data.message || "Status updated");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update status");
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
        <div style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <p style={{ marginTop: "16px", color: "#fff" }}>Loading...</p>
      </div>
      </>
    );
  }

  /* ---------------- REGISTER ---------------- */

  if (!isRegistered) {
    return (
      <div style={styles.bg}>
        <div style={styles.overlay}></div>

        <div style={styles.centerWrap}>
          <div style={styles.glassCard}>
            <div style={styles.iconCircle}>🤝</div>

            <h1 style={styles.title}>Join as Volunteer</h1>
            <p style={styles.subtitle}>
              Become a part of positive change in your city.
            </p>

            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Volunteer Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ngoName: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
              )}

              <button type="submit" style={styles.btn}>
                Start Volunteering →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <div style={styles.bg}>
      <div style={styles.overlay}></div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
          animation: 'slideInRight 0.4s ease-out',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '320px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>{notification.title}</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>{notification.message}</div>
          {notification.data?.severity && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Severity: {'⭐'.repeat(notification.data.severity)}
            </div>
          )}
        </div>
      )}

      <div style={styles.dashboard}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div>
            <div style={styles.brandBox}>
              <div style={styles.iconCircleSmall}>🤝</div>
              <div>
                <div style={styles.brandTitle}>JanSevak</div>
                <div style={styles.brandSub}>Volunteer Hub</div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("dashboard")}
              style={activeTab === "dashboard" ? styles.menuActive : styles.menu}
            >
              🏠 Dashboard
            </div>
            <div
              onClick={() => setActiveTab("heatmap")}
              style={activeTab === "heatmap" ? styles.menuActive : styles.menu}
            >
              🗺️ Heatmap
            </div>
            <div
              onClick={() => setActiveTab("tasks")}
              style={activeTab === "tasks" ? styles.menuActive : styles.menu}
            >
              📌 Tasks
            </div>
            <div style={styles.menu}>🏆 Rewards</div>
            <div style={styles.menu}>⚙️ Settings</div>
          </div>

          <div style={styles.profileMini}>
            <div style={styles.avatar}>
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <div style={{ fontWeight: "600" }}>{currentUser?.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>
                {isActive ? "🟢 Active" : "⚪ Inactive"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {/* Topbar */}
          <div style={styles.topbar}>
            <div>
              <h2 style={{ margin: 0, color: "#fff" }}>
                Welcome, {currentUser?.name}
              </h2>

              <p style={{ margin: "4px 0 0", color: "#ddd" }}>
                {currentUser?.type === "NGO_Affiliated"
                  ? `Representing ${currentUser?.ngoName}`
                  : "Individual Volunteer"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={toggleVolunteerStatus}
                style={{
                  ...styles.statusBtn,
                  background: isActive
                    ? "linear-gradient(135deg,#10b981,#059669)"
                    : "linear-gradient(135deg,#6b7280,#4b5563)",
                }}
              >
                {isActive ? "🟢 Active" : "⚪ Inactive"}
              </button>

              <div style={styles.pointsBox}>
                🏆 {currentUser?.points || 0} Points
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statGlass}>
              <h3>{tasks.length}</h3>
              <p>Nearby Tasks</p>
            </div>

            <div style={styles.statGlass}>
              <h3>{currentUser?.points || 0}</h3>
              <p>Total Points</p>
            </div>

            <div style={styles.statGlass}>
              <h3>{isActive ? "Live" : "Paused"}</h3>
              <p>Volunteer Status</p>
            </div>
          </div>

          {/* Content Sections */}
          {activeTab === "dashboard" && (
            <>
              {/* Heatmap */}
              <div style={styles.sectionGlass}>
                <h3 style={styles.sectionHeading}>📍 Live Issue Heatmap</h3>

                <div style={{ borderRadius: "14px", overflow: "hidden" }}>
                  {hasMapboxToken ? (
                    <HeatmapView />
                  ) : (
                    <div style={{ padding: "30px", textAlign: "center", color: "#999" }}>
                      Map token not configured
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div style={styles.sectionGlass}>
                <h3 style={styles.sectionHeading}>🚀 Nearby Tasks</h3>

                <div style={styles.taskGrid}>
                  {tasks.map((task, index) => (
                    <div key={index} style={styles.taskCard}>
                      <div style={styles.taskTop}>
                        <h4 style={{ margin: 0 }}>{task.category}</h4>

                        <span style={styles.reward}>
                          +{task.pointsReward} pts
                        </span>
                      </div>

                      <p style={styles.taskDesc}>
                        {task.description}
                      </p>

                      <div style={styles.taskBottom}>
                        <span style={{ fontSize: "13px" }}>
                          📍 {task.address}
                        </span>

                        <button
                          onClick={() => handleApply(task.reportId)}
                          style={styles.btnSmall}
                        >
                          Help Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "heatmap" && (
            <div style={styles.sectionGlass}>
              <h3 style={styles.sectionHeading}>📍 Live Issue Heatmap</h3>

              <div style={{ borderRadius: "14px", overflow: "hidden" }}>
                {hasMapboxToken ? (
                  <HeatmapView />
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#999" }}>
                    Map token not configured
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div style={styles.sectionGlass}>
              <h3 style={styles.sectionHeading}>🚀 Nearby Tasks</h3>

              <div style={styles.taskGrid}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <div key={index} style={styles.taskCard}>
                      <div style={styles.taskTop}>
                        <h4 style={{ margin: 0 }}>{task.category}</h4>

                        <span style={styles.reward}>
                          +{task.pointsReward} pts
                        </span>
                      </div>

                      <p style={styles.taskDesc}>
                        {task.description}
                      </p>

                      <div style={styles.taskBottom}>
                        <span style={{ fontSize: "13px" }}>
                          📍 {task.address}
                        </span>

                        <button
                          onClick={() => handleApply(task.reportId)}
                          style={styles.btnSmall}
                        >
                          Help Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#999", textAlign: "center" }}>
                    No tasks available at the moment.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  bg: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#0f172a,#1e1b4b,#312e81,#4c1d95)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    backdropFilter: "blur(4px)",
  },

  centerWrap: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
  },

  glassCard: {
    width: "100%",
    maxWidth: "520px",
    padding: "35px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
    color: "#fff",
  },

  iconCircle: {
    width: "65px",
    height: "65px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
  },

  subtitle: {
    color: "#d1d5db",
    marginTop: "8px",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  btn: {
    marginTop: "8px",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 8px 20px rgba(99,102,241,0.4)",
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#111827,#312e81)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  dashboard: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    minHeight: "100vh",
    padding: "18px",
    gap: "18px",
  },

  sidebar: {
    width: "250px",
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
  },

  brandBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "25px",
  },

  iconCircleSmall: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  brandTitle: {
    fontWeight: "700",
    fontSize: "16px",
  },

  brandSub: {
    fontSize: "12px",
    opacity: 0.8,
  },

  menu: {
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "8px",
    cursor: "pointer",
    opacity: 0.9,
    transition: "all 0.3s ease",
  },

  menuActive: {
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "8px",
    background: "rgba(255,255,255,0.16)",
    cursor: "pointer",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },

  profileMini: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#8b5cf6,#6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  topbar: {
    padding: "20px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusBtn: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "14px",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  pointsBox: {
    padding: "12px 18px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "16px",
  },

  statGlass: {
    padding: "20px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  sectionGlass: {
    padding: "20px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
  },

  sectionHeading: {
    marginTop: 0,
    marginBottom: "18px",
  },

  taskGrid: {
    display: "grid",
    gap: "16px",
  },

  taskCard: {
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
  },

  reward: {
    padding: "6px 10px",
    borderRadius: "30px",
    background:
      "linear-gradient(135deg,#22c55e,#16a34a)",
    fontSize: "12px",
    fontWeight: "700",
  },

  taskDesc: {
    marginTop: "10px",
    color: "#e5e7eb",
    fontSize: "14px",
  },

  taskBottom: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  btnSmall: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },
};