import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";

import HomePage from "./pages/HomePage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import VolunteerPage from "./pages/VolunteerPage";

import AdminPage from "./pages/admin-dashboard/AdminPage";
import AdminVolunteersPage from "./pages/admin-dashboard/AdminVolunteersPage";
import IssuesPage from "./pages/admin-dashboard/IssuesPage";
import AdminSettings from "./pages/admin-dashboard/SettingsPage";
import AdminHeatmap from "./Components/AdminHeatmap";

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
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/volunteer" element={
          <PrivateRoute requiredRole="volunteer"><VolunteerPage /></PrivateRoute>
        } />

        <Route path="/user" element={<PrivateRoute requiredRole="user"><Dashboard /></PrivateRoute>} />
        <Route path="/user/issues" element={<PrivateRoute requiredRole="user"><MyIssues /></PrivateRoute>} />
        <Route path="/user/my-issues" element={<PrivateRoute requiredRole="user"><MyIssues /></PrivateRoute>} />
        <Route path="/user/report" element={<PrivateRoute requiredRole="user"><ReportIssue /></PrivateRoute>} />
        <Route path="/user/profile" element={<PrivateRoute requiredRole="user"><Profile /></PrivateRoute>} />
        <Route path="/user/rewards" element={<PrivateRoute requiredRole="user"><Rewards /></PrivateRoute>} />
        <Route path="/user/settings" element={<PrivateRoute requiredRole="user"><UserSettings /></PrivateRoute>} />
        <Route path="/user/heatmap" element={<PrivateRoute requiredRole="user"><Heatmapview /></PrivateRoute>} />

        <Route path="/admin" element={<PrivateRoute requiredRole="admin"><AdminLayout /></PrivateRoute>}>
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