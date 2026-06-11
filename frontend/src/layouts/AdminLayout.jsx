import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, List, Users, Settings, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "All Issues", icon: List, path: "/admin/issues" },
    { name: "Volunteers", icon: Users, path: "/admin/volunteers" },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col z-30
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-400">JanSevak</h1>
            <p className="text-xs text-slate-400">ADMIN PANEL</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleNav(item.path)}
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

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-sm font-bold text-indigo-400">JanSevak Admin</h1>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}