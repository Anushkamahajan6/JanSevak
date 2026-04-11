import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import VolunteerPage from "./pages/VolunteerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
