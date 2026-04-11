import { useState, useEffect } from 'react';
import HeatmapView from '../components/HeatmapView'; // Adjust path if your Heatmap is saved elsewhere!

export default function VolunteerPage() {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration & User State
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'Individual', ngoName: '' });

  // 1. Fetch tasks on load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/volunteer/tasks');
        const data = await response.json();
        setTasks(data.tasks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // 2. Handle Registration (Point 1)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/volunteer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.volunteer);
        setIsRegistered(true);
      } else {
        alert("Error registering: " + data.error);
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  // 3. Handle Apply for Task
  const handleApply = async (taskId) => {
    try {
      const response = await fetch('http://localhost:5000/api/volunteer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: currentUser._id, // Now using the REAL user ID!
          taskId: taskId
        })
      });
      const data = await response.json();
      alert(data.message); // Will say "Assigned" or "Pending"
    } catch (error) {
      console.error("Error applying:", error);
    }
  };

  // --- UI: REGISTRATION SCREEN ---
  if (!isRegistered) {
    return (
      <div style={{ padding: '40px', maxWidth: '500px', margin: '40px auto', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ color: '#166534', marginBottom: '20px' }}>Join as a Volunteer</h2>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ fontWeight: 'bold' }}>Full Name:</label>
          <input required type="text" placeholder="Aditi" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

          <label style={{ fontWeight: 'bold' }}>Volunteer Type:</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="Individual">Individual Citizen</option>
            <option value="NGO_Affiliated">NGO Affiliated</option>
          </select>

          {formData.type === 'NGO_Affiliated' && (
            <>
              <label style={{ fontWeight: 'bold' }}>NGO Name:</label>
              <input required type="text" placeholder="e.g. Green Earth Society" value={formData.ngoName} onChange={(e) => setFormData({...formData, ngoName: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </>
          )}

          <button type="submit" style={{ backgroundColor: '#22c55e', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            Start Volunteering!
          </button>
        </form>
      </div>
    );
  }

  // --- UI: MAIN DASHBOARD ---
  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
        <div>
          <h1 style={{ margin: 0, color: '#166534', fontSize: '24px' }}>Welcome, {currentUser.name}!</h1>
          <p style={{ margin: '5px 0 0 0', color: '#15803d' }}>{currentUser.type === 'NGO_Affiliated' ? `Representing ${currentUser.ngoName}` : 'Individual Volunteer'}</p>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '10px 20px', borderRadius: '8px' }}>
          🏆 Points: {currentUser.points}
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
            </div>
            
            <p style={{ margin: '0 0 15px 0', color: '#4b5563' }}>{task.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>📍 {task.address}</span>
              <button 
                onClick={() => handleApply(task.reportId)}
                style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                I want to help!
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}