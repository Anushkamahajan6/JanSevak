import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, List, Users, Settings } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "All Issues", icon: List, path: "/admin/issues" },
    { name: "Volunteers", icon: Users, path: "/admin/volunteers" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col">

        <div className="mb-8">
          <h1 className="text-xl font-bold text-indigo-400">JanSevak</h1>
          <p className="text-xs text-slate-400">ADMIN PANEL</p>
        </div>

        <div className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition ${
                  location.pathname === item.path
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800 text-sm text-slate-400">
          Admin Panel
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}