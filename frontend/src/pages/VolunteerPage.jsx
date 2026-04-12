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

  // ✅ OTHER PERSON VERSION
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

  const renderDashboardTab = () => (
    <div>
      <h2 style={{ color: "#fff" }}>Dashboard</h2>
      <p style={{ color: "#ccc" }}>Welcome to volunteer dashboard</p>
    </div>
  );

  const renderHeatmapTab = () => (
    <div>
      <h2 style={{ color: "#fff" }}>Heatmap</h2>
      {hasMapboxToken ? <HeatmapView /> : <p style={{ color: "#fff" }}>Map token missing</p>}
    </div>
  );

  const renderTasksTab = () => (
    <div>
      <h2 style={{ color: "#fff" }}>Tasks</h2>
      {tasks.map((task, index) => (
        <div key={index}>
          <p>{task.category}</p>
          <button onClick={() => handleApply(task.reportId)}>
            Apply
          </button>
        </div>
      ))}
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === "dashboard") return renderDashboardTab();
    if (activeTab === "heatmap") return renderHeatmapTab();
    if (activeTab === "tasks") return renderTasksTab();
    return renderDashboardTab();
  };

  if (!isRegistered) {
    return (
      <form onSubmit={handleRegister}>
        <input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Volunteer Dashboard</h1>

      <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
      <button onClick={() => setActiveTab("heatmap")}>Heatmap</button>
      <button onClick={() => setActiveTab("tasks")}>Tasks</button>

      <button onClick={toggleVolunteerStatus}>
        {isActive ? "Active" : "Inactive"}
      </button>

      <div>
        🏆 {currentUser?.points || 0} Points
      </div>

      {renderActiveTab()}
    </div>
  );
}