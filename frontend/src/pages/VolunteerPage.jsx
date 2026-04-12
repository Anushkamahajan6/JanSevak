import { useState, useEffect } from "react";
import HeatmapView from "../components/HeatmapView";
 
export default function VolunteerPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    name: "",
    type: "Individual",
    ngoName: "",
  });

  const hasMapboxToken = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

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
      const res = await fetch("http://localhost:5000/api/volunteer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

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
      const res = await fetch("http://localhost:5000/api/volunteer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: currentUser?._id,
          taskId,
        }),
      });

      const data = await res.json();
      alert(data.message || "Applied successfully");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const toggleVolunteerStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/volunteer/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteerId: currentUser?._id,
          isActive: !isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsActive(!isActive);
        alert(data.message || "Status updated");
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const stats = {
    availableTasks: tasks.length,
    totalPoints: currentUser?.points || 0,
    volunteerType:
      currentUser?.type === "NGO_Affiliated"
        ? "NGO Volunteer"
        : "Individual Volunteer",
  };

  const renderDashboardTab = () => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>📌</div>
          <div style={styles.statNumber}>{stats.availableTasks}</div>
          <div style={styles.statLabel}>Available Tasks</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>🏆</div>
          <div style={styles.statNumber}>{stats.totalPoints}</div>
          <div style={styles.statLabel}>Total Points</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>⚡</div>
          <div style={styles.statNumber}>{isActive ? "ON" : "OFF"}</div>
          <div style={styles.statLabel}>Volunteer Status</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.sectionTitle}>Quick Overview</div>
            <div style={styles.sectionSub}>
              Manage tasks, activity, and hotspot response from one place.
            </div>
          </div>
        </div>

        <div style={styles.quickGrid}>
          <div style={styles.quickCard}>
            <div style={styles.quickTitle}>Current Role</div>
            <div style={styles.quickValue}>{stats.volunteerType}</div>
          </div>

          <div style={styles.quickCard}>
            <div style={styles.quickTitle}>Availability</div>
            <div style={styles.quickValue}>
              {isActive ? "Active for Hotspots" : "Not Active"}
            </div>
          </div>

          <div style={styles.quickCard}>
            <div style={styles.quickTitle}>Top Priority</div>
            <div style={styles.quickValue}>
              {tasks[0]?.category || "No task available"}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.sectionTitle}>Nearby Tasks Preview</div>
            <div style={styles.sectionSub}>
              Your latest nearby issues ready for action.
            </div>
          </div>

          <button
            style={styles.secondaryBtn}
            onClick={() => setActiveTab("tasks")}
          >
            View All Tasks
          </button>
        </div>

        <div style={styles.taskGrid}>
          {tasks.slice(0, 3).map((task, index) => (
            <div key={index} style={styles.taskCard}>
              <div style={styles.taskTop}>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>
                  {task.category}
                </h3>
                <span style={styles.rewardBadge}>+{task.pointsReward} pts</span>
              </div>

              <p style={styles.taskDesc}>{task.description}</p>

              <div style={styles.taskBottom}>
                <span style={styles.location}>📍 {task.address}</span>
                <button
                  onClick={() => handleApply(task.reportId)}
                  style={styles.primaryBtnSmall}
                >
                  I Want To Help
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderHeatmapTab = () => (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>Live Issue Heatmap</div>
          <div style={styles.sectionSub}>
            Track hotspot areas and high-priority community activity.
          </div>
        </div>
      </div>

      <div style={styles.heatmapWrapper}>
        {hasMapboxToken ? (
          <HeatmapView />
        ) : (
          <div style={styles.mapFallback}>
            Mapbox token missing. Add `VITE_MAPBOX_TOKEN` in frontend `.env` to
            enable heatmap.
          </div>
        )}
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>Nearby Tasks</div>
          <div style={styles.sectionSub}>
            Pick a task and respond quickly to community needs.
          </div>
        </div>
      </div>

      <div style={styles.taskGrid}>
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={index} style={styles.taskCard}>
              <div style={styles.taskTop}>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>
                  {task.category}
                </h3>
                <span style={styles.rewardBadge}>+{task.pointsReward} pts</span>
              </div>

              <p style={styles.taskDesc}>{task.description}</p>

              <div style={styles.taskBottom}>
                <span style={styles.location}>📍 {task.address}</span>
                <button
                  onClick={() => handleApply(task.reportId)}
                  style={styles.primaryBtnSmall}
                >
                  I Want To Help
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>No tasks available right now.</div>
        )}
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>Rewards & Progress</div>
          <div style={styles.sectionSub}>
            Track your contribution score and volunteer growth.
          </div>
        </div>
      </div>

      <div style={styles.rewardPanel}>
        <div style={styles.rewardBig}>🏆 {currentUser?.points || 0}</div>
        <div style={styles.rewardText}>Total Impact Points</div>
      </div>

      <div style={styles.rewardList}>
        <div style={styles.rewardItem}>
          <span>🥉 Bronze Helper</span>
          <span>100 pts</span>
        </div>
        <div style={styles.rewardItem}>
          <span>🥈 Silver Responder</span>
          <span>250 pts</span>
        </div>
        <div style={styles.rewardItem}>
          <span>🥇 Gold Champion</span>
          <span>500 pts</span>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <div style={styles.sectionTitle}>Volunteer Settings</div>
          <div style={styles.sectionSub}>
            Basic account and activity controls.
          </div>
        </div>
      </div>

      <div style={styles.settingsBox}>
        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Name</span>
          <span style={styles.settingValue}>
            {currentUser?.name || "Volunteer"}
          </span>
        </div>

        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Volunteer Type</span>
          <span style={styles.settingValue}>
            {currentUser?.type === "NGO_Affiliated"
              ? `NGO - ${currentUser?.ngoName || "N/A"}`
              : "Individual"}
          </span>
        </div>

        <div style={styles.settingRow}>
          <span style={styles.settingLabel}>Availability</span>
          <span style={styles.settingValue}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === "dashboard") return renderDashboardTab();
    if (activeTab === "heatmap") return renderHeatmapTab();
    if (activeTab === "tasks") return renderTasksTab();
    if (activeTab === "rewards") return renderRewardsTab();
    if (activeTab === "settings") return renderSettingsTab();
    return renderDashboardTab();
  };

  if (!isRegistered) {
    return (
      <div style={styles.pageBg}>
        <div style={styles.registerShell}>
          <div style={styles.blurBallOne}></div>
          <div style={styles.blurBallTwo}></div>

          <div style={styles.registerCard}>
            <div style={styles.logoBox}>🤝</div>

            <h1 style={styles.registerTitle}>Join as Volunteer</h1>
            <p style={styles.registerSub}>
              Help solve real community issues and become the face of positive
              action.
            </p>

            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Volunteer Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
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
                      setFormData({ ...formData, ngoName: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              )}

              <button type="submit" style={styles.primaryBtn}>
                Start Volunteering
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.pageBg}>
        <div style={styles.loadingGlass}>Loading volunteer dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardBg}>
      <div style={styles.bgGlowOne}></div>
      <div style={styles.bgGlowTwo}></div>

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <div>
            <div style={styles.brand}>
              <div style={styles.brandIcon}>🤝</div>
              <div>
                <div style={styles.brandTitle}>JanSevak</div>
                <div style={styles.brandSub}>Volunteer Hub</div>
              </div>
            </div>

            <div
              style={activeTab === "dashboard" ? styles.menuActive : styles.menu}
              onClick={() => setActiveTab("dashboard")}
            >
              🏠 Dashboard
            </div>

            <div
              style={activeTab === "heatmap" ? styles.menuActive : styles.menu}
              onClick={() => setActiveTab("heatmap")}
            >
              🗺️ Heatmap
            </div>

            <div
              style={activeTab === "tasks" ? styles.menuActive : styles.menu}
              onClick={() => setActiveTab("tasks")}
            >
              📌 Tasks
            </div>

            <div
              style={activeTab === "rewards" ? styles.menuActive : styles.menu}
              onClick={() => setActiveTab("rewards")}
            >
              🏆 Rewards
            </div>

            <div
              style={activeTab === "settings" ? styles.menuActive : styles.menu}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </div>
          </div>

          <div style={styles.userBox}>
            <div style={styles.avatar}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || "V"}
            </div>

            <div>
              <div style={styles.userName}>
                {currentUser?.name || "Volunteer"}
              </div>
              <div style={styles.userRole}>Community Volunteer</div>
            </div>
          </div>
        </div>

        <div style={styles.main}>
          <div style={styles.topbar}>
            <div>
              <h2 style={styles.topHeading}>
                Welcome, {currentUser?.name || "Volunteer"}
              </h2>
              <p style={styles.topSub}>
                {currentUser?.type === "NGO_Affiliated"
                  ? `Representing ${currentUser?.ngoName || "NGO"}`
                  : "Individual Volunteer"}
              </p>
            </div>

            <div style={styles.topbarRight}>
              <button
                onClick={toggleVolunteerStatus}
                style={
                  isActive ? styles.activeStatusBtn : styles.inactiveStatusBtn
                }
              >
                {isActive ? "🟢 Active Now" : "🔴 Go Active"}
              </button>

              <div style={styles.pointsBadge}>
                🏆 {currentUser?.points || 0} Points
              </div>
            </div>
          </div>

          <div style={styles.content}>{renderActiveTab()}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #581c87 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  registerShell: {
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  blurBallOne: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.35)",
    filter: "blur(70px)",
    top: "-30px",
    left: "18%",
  },

  blurBallTwo: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "rgba(168,85,247,0.28)",
    filter: "blur(80px)",
    bottom: "-40px",
    right: "18%",
  },

  registerCard: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "26px",
    padding: "36px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    zIndex: 2,
  },

  logoBox: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "18px",
  },

  registerTitle: {
    margin: 0,
    fontSize: "32px",
    color: "#fff",
    fontWeight: "700",
  },

  registerSub: {
    color: "rgba(255,255,255,0.78)",
    marginTop: "10px",
    marginBottom: "24px",
    lineHeight: 1.5,
  },

  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#fff",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "14px",
    outline: "none",
    color: "#fff",
    background: "rgba(255,255,255,0.08)",
  },

  primaryBtn: {
    background: "linear-gradient(135deg, #7c3aed, #4338ca)",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 12px 24px rgba(67,56,202,0.35)",
  },

  loadingGlass: {
    color: "#fff",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "20px 28px",
    borderRadius: "18px",
    backdropFilter: "blur(16px)",
    fontWeight: "600",
  },

  dashboardBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1120 0%, #1d1b4b 45%, #4c1d95 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  bgGlowOne: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.24)",
    filter: "blur(90px)",
    top: "-60px",
    left: "-40px",
  },

  bgGlowTwo: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(192,132,252,0.18)",
    filter: "blur(100px)",
    right: "-80px",
    bottom: "-60px",
  },

  layout: {
    display: "flex",
    minHeight: "100vh",
    padding: "20px",
    gap: "18px",
    position: "relative",
    zIndex: 2,
  },

  sidebar: {
    width: "250px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },

  brand: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "24px",
  },

  brandIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  brandTitle: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#fff",
  },

  brandSub: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.72)",
  },

  menu: {
    padding: "12px 14px",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.82)",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "0.2s",
  },

  menuActive: {
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "8px",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  userBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #4338ca)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  userName: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#fff",
  },

  userRole: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.7)",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  topbar: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "24px",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
  },

  topHeading: {
    margin: 0,
    color: "#fff",
    fontSize: "28px",
  },

  topSub: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "rgba(255,255,255,0.78)",
  },

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  activeStatusBtn: {
    border: "none",
    padding: "11px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(34,197,94,0.28)",
  },

  inactiveStatusBtn: {
    border: "none",
    padding: "11px 16px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(239,68,68,0.28)",
  },

  pointsBadge: {
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    padding: "11px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },

  statCard: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(16px)",
  },

  statIconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.12)",
    marginBottom: "12px",
    fontSize: "20px",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
  },

  statLabel: {
    marginTop: "6px",
    color: "rgba(255,255,255,0.74)",
    fontSize: "13px",
  },

  card: {
    background: "rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 18px 38px rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(18px)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#fff",
  },

  sectionSub: {
    marginTop: "5px",
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
  },

  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  quickCard: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "18px",
  },

  quickTitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "13px",
    marginBottom: "10px",
  },

  quickValue: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
  },

  taskGrid: {
    display: "grid",
    gap: "16px",
  },

  taskCard: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "18px",
    background: "rgba(255,255,255,0.1)",
  },

  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  rewardBadge: {
    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  taskDesc: {
    marginTop: "10px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  taskBottom: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  location: {
    color: "rgba(255,255,255,0.74)",
    fontSize: "13px",
  },

  primaryBtnSmall: {
    background: "linear-gradient(135deg, #4338ca, #7c3aed)",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 10px 20px rgba(67,56,202,0.28)",
  },

  heatmapWrapper: {
    borderRadius: "18px",
    overflow: "hidden",
    minHeight: "420px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  mapFallback: {
    minHeight: "420px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: "20px",
    textAlign: "center",
  },

  rewardPanel: {
    background: "linear-gradient(135deg, rgba(124,58,237,0.55), rgba(67,56,202,0.42))",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "center",
    marginBottom: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  rewardBig: {
    color: "#fff",
    fontSize: "34px",
    fontWeight: "700",
  },

  rewardText: {
    color: "rgba(255,255,255,0.78)",
    marginTop: "8px",
    fontSize: "14px",
  },

  rewardList: {
    display: "grid",
    gap: "12px",
  },

  rewardItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "16px",
    color: "#fff",
  },

  settingsBox: {
    display: "grid",
    gap: "12px",
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "16px",
    color: "#fff",
    gap: "16px",
    flexWrap: "wrap",
  },

  settingLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
  },

  settingValue: {
    fontWeight: "700",
  },

  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
  },
};