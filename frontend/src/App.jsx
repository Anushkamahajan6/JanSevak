import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import VolunteerPage from "./pages/VolunteerPage";
import Dashboard from "./pages/user-dashboard/Dashboard";
import AdminHeatmap from "./Components/AdminHeatmap";
import heatmapview from "./Components/heatmapview";

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
        <Route path="/heatmap" element={<heatmapview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;