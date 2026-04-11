import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import VolunteerPage from "./pages/VolunteerPage";
import Dashboard from "./pages/user-dashboard/Dashboard";
import AdminHeatmap from "./Components/AdminHeatmap";
import HeatmapView from "./components/HeatmapView";
import MyIssues from "./pages/user-dashboard/MyIssues";
import ReportIssue from "./pages/user-dashboard/ReportIssue";
import Rewards from "./pages/user-dashboard/Rewards";
import Profile from "./pages/user-dashboard/Profile";
import Settings from "./pages/user-dashboard/Settings";

function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/volunteer" element={<VolunteerPage />} />
    <Route path="/user" element={<Dashboard />} />
    <Route path="/admin/heatmap" element={<AdminHeatmap />} />
    <Route path="/heatmapView" element={<HeatmapView />} />
    <Route path="/user/my-issues" element={<MyIssues />} />
    <Route path="/user/report" element={<ReportIssue />} />
    <Route path="/user/rewards" element={<Rewards />} />
    <Route path="/user/profile" element={<Profile />} />
    <Route path="/user/settings" element={<Settings />} />
  </Routes>
</BrowserRouter>
  );
}

export default App;