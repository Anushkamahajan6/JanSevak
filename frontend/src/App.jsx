import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

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
import Heatmapview from "./Components/Heatmapview";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/volunteer" element={<VolunteerPage />} />

        <Route path="/user" element={<Dashboard />} />
        <Route path="/user/issues" element={<MyIssues />} />
        <Route path="/user/my-issues" element={<MyIssues />} />
        <Route path="/user/report" element={<ReportIssue />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/rewards" element={<Rewards />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/user/heatmap" element={<Heatmapview />} />

        // REPLACE your flat admin routes with this nested structure:
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminPage />} />
  <Route path="issues" element={<IssuesPage />} />
  <Route path="volunteers" element={<AdminVolunteersPage />} />
  <Route path="settings" element={<AdminSettings />} />
  <Route path="heatmap" element={<AdminHeatmap />} />
</Route>

        <Route path="/heatmapView" element={<Heatmapview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
