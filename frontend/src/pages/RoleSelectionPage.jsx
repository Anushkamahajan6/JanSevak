import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "Citizen",
      description: "Report civic issues and track them",
      icon: "👤",
      color: "bg-blue-50 border-blue-300"
    },
    {
      id: "volunteer",
      title: "Volunteer",
      description: "Help resolve community issues",
      icon: "🤝",
      color: "bg-green-50 border-green-300"
    },
    {
      id: "admin",
      title: "Admin / NGO",
      description: "Manage issues and volunteers",
      icon: "🔐",
      color: "bg-purple-50 border-purple-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to JanSevak</h1>
        <p className="text-xl text-gray-300">Choose your role to continue</p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`border-2 rounded-xl p-8 cursor-pointer transition transform hover:scale-105 hover:shadow-xl ${role.color}`}
          >
            <div className="text-6xl mb-4">{role.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h2>
            <p className="text-gray-700 mb-8">{role.description}</p>

            <div className="space-y-3">
              <button
                onClick={() => navigate(`/login?role=${role.id}`)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/signup?role=${role.id}`)}
                className="w-full py-2 px-4 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-gray-400 text-center text-sm">
        Smart Citizens + Smart Governance = Better Communities
      </p>
    </div>
  );
}

export default RoleSelectionPage;
