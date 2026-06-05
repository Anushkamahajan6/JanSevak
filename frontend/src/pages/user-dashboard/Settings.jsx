import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, MapPin, LogOut } from "lucide-react";
import { useUser } from "../../context/userContext";

export default function Settings() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("userSettings") || "{}");
    if (s.notifications !== undefined) setNotifications(s.notifications);
    if (s.locationAccess !== undefined) setLocationAccess(s.locationAccess);
  }, []);

  const handleSave = () => {
    localStorage.setItem("userSettings", JSON.stringify({ notifications, locationAccess }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    navigate("/");
  };

  const Toggle = ({ value, onClick }) => (
    <button
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-white/20"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-7" : "left-1"}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6 text-white">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate("/user")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7 space-y-6">
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your preferences.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-slate-400">Issue updates and alerts</p>
                </div>
              </div>
              <Toggle value={notifications} onClick={() => setNotifications(!notifications)} />
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Location Access</p>
                  <p className="text-xs text-slate-400">Required for issue reporting</p>
                </div>
              </div>
              <Toggle value={locationAccess} onClick={() => setLocationAccess(!locationAccess)} />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${saved ? "bg-emerald-500/80 text-white" : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-90"}`}
          >
            {saved ? "Saved" : "Save Settings"}
          </button>

          <div className="border-t border-white/10 pt-5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm font-medium hover:bg-red-500/20 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}