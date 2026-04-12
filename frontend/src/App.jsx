import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import VolunteerPage from "./pages/VolunteerPage";

// Admin
import AdminPage from "./pages/admin-dashboard/AdminPage";
import AdminVolunteersPage from "./pages/admin-dashboard/AdminVolunteersPage";
import IssuesPage from "./pages/admin-dashboard/IssuesPage";
import AdminSettings from "./pages/admin-dashboard/SettingsPage";
import AdminHeatmap from "./Components/AdminHeatmap";

// User
import Dashboard from "./pages/user-dashboard/Dashboard";
import MyIssues from "./pages/user-dashboard/MyIssues";
import ReportIssue from "./pages/user-dashboard/ReportIssue";
import Profile from "./pages/user-dashboard/Profile";
import Rewards from "./pages/user-dashboard/Rewards";
import UserSettings from "./pages/user-dashboard/Settings";

// Heatmaps (both versions kept)
import Heatmapview from "./Components/heatmapview"; // renamed to avoid conflict

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Volunteer */}
        <Route path="/volunteer" element={<VolunteerPage />} />

        {/* User */}
        <Route path="/user" element={<Dashboard />} />
        <Route path="/user/issues" element={<MyIssues />} />
        <Route path="/user/my-issues" element={<MyIssues />} />
        <Route path="/user/report" element={<ReportIssue />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/rewards" element={<Rewards />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/user/heatmap" element={<Heatmapview />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/volunteers" element={<AdminVolunteersPage />} />
        <Route path="/admin/issues" element={<IssuesPage />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/heatmap" element={<AdminHeatmap />} />

        {/* Extra */}
        <Route path="/heatmapView" element={<HeatmapView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;