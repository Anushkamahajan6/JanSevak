import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, ClipboardList, CheckCircle, Gift, Map, Shield, ChevronRight } from "lucide-react";

function HomePage() {
  const navigate = useNavigate();

  const workflowSteps = [
    { number: "01", title: "Report", description: "Citizen submits a civic issue with location, category, and photos." },
    { number: "02", title: "Review", description: "Admin verifies and prioritizes the complaint on the dashboard." },
    { number: "03", title: "Assign", description: "Issue is assigned to a nearby available volunteer." },
    { number: "04", title: "Resolve", description: "Volunteer completes the task and uploads proof of resolution." },
    { number: "05", title: "Notify", description: "Citizen receives a real-time status update on their report." },
    { number: "06", title: "Reward", description: "Both citizen and volunteer earn points and badges for participation." },
  ];

  const features = [
    { icon: <Map className="w-5 h-5" />, title: "Location-based Issue Mapping", description: "GPS-enabled reporting to identify problem hotspots across the community." },
    { icon: <Users className="w-5 h-5" />, title: "Community-Powered Resolution", description: "Volunteers and citizens collaborate to fix issues at the ground level." },
    { icon: <ClipboardList className="w-5 h-5" />, title: "End-to-End Tracking", description: "Every issue is tracked from submission to closure with full transparency." },
    { icon: <CheckCircle className="w-5 h-5" />, title: "Clear Accountability", description: "Defined ownership at every stage — no issue falls through the cracks." },
    { icon: <Gift className="w-5 h-5" />, title: "Incentive System", description: "Earn points and unlock badges for reporting and resolving civic issues." },
    { icon: <Shield className="w-5 h-5" />, title: "Secure & Role-based Access", description: "Separate access for citizens, volunteers, and admins with protected routes." },
  ];

  const roles = [
    {
      title: "Citizen",
      description: "Report civic issues in your area and track them to resolution in real time.",
      features: ["Submit issues with photos & location", "Track status live", "Earn reward points", "View community activity"],
      loginPath: "/login?role=user",
      signupPath: "/signup?role=user",
      accent: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
      badge: "text-blue-300 bg-blue-500/10",
    },
    {
      title: "Volunteer",
      description: "Find nearby pending issues and help your community by resolving them.",
      features: ["Browse nearby tasks", "Upload completion proof", "Earn points & climb leaderboard", "Get task recommendations"],
      loginPath: "/login?role=volunteer",
      signupPath: "/signup?role=volunteer",
      accent: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
      badge: "text-emerald-300 bg-emerald-500/10",
    },
    {
      title: "Admin / NGO",
      description: "Monitor all issues, manage volunteers, and analyse community data.",
      features: ["Live issue monitoring", "Heatmap of problem areas", "Volunteer management", "Analytics & reports"],
      loginPath: "/login?role=admin",
      signupPath: "/signup?role=admin",
      accent: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
      badge: "text-violet-300 bg-violet-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-xl font-bold tracking-tight">JanSevak</span>
            <span className="ml-2 text-xs text-slate-400 font-medium">Community Issue Portal</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/15 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-sm font-semibold hover:opacity-90 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-slate-300 mb-6">
          Civic Issue Management Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          From Complaint to
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Community Resolution
          </span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
          JanSevak connects citizens, volunteers, and administrators to report, track, and resolve civic issues transparently and efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 font-semibold text-sm hover:opacity-90 transition flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-7 py-3 rounded-xl bg-white/10 border border-white/10 font-medium text-sm hover:bg-white/15 transition"
          >
            Login
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { label: "Issues Tracked", value: "End-to-End" },
            { label: "Volunteer Network", value: "Community" },
            { label: "Resolution Rate", value: "Transparent" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-base font-bold text-indigo-300">{s.value}</div>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How JanSevak Works</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">A structured six-step process from issue reporting to resolution and reward.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((step, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <span className="text-xs font-mono text-violet-400 font-semibold">{step.number}</span>
              <h3 className="text-lg font-bold mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Platform Capabilities</h2>
          <p className="text-slate-400 text-sm">Built for accountability, transparency, and community-driven action.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Choose Your Role</h2>
          <p className="text-slate-400 text-sm">Each role has a dedicated dashboard and specific capabilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <div key={i} className={`bg-gradient-to-br ${role.accent} border rounded-2xl p-7 flex flex-col`}>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-4 ${role.badge}`}>{role.title}</span>
              <p className="text-sm text-slate-300 mb-5 leading-relaxed">{role.description}</p>
              <ul className="space-y-2 mb-7 flex-1">
                {role.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-slate-300">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(role.loginPath)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm font-medium hover:bg-white/15 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate(role.signupPath)}
                  className="flex-1 py-2.5 rounded-xl bg-white/15 border border-white/20 text-sm font-semibold hover:bg-white/20 transition"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-10">
        <div className="bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Get Involved?</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-xl mx-auto">
            Join as a citizen to report issues, as a volunteer to resolve them, or as an admin to coordinate the community.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2"
          >
            Create an Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-sm">
            <div>
              <p className="font-bold text-white mb-2">JanSevak</p>
              <p className="text-slate-500 text-xs leading-relaxed">Civic issue management for better communities.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-3">Citizens</p>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><button onClick={() => navigate("/signup?role=user")} className="hover:text-white transition">Report an Issue</button></li>
                <li><button onClick={() => navigate("/login?role=user")} className="hover:text-white transition">Track Status</button></li>
                <li><button onClick={() => navigate("/login?role=user")} className="hover:text-white transition">Rewards</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-3">Volunteers</p>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><button onClick={() => navigate("/signup?role=volunteer")} className="hover:text-white transition">Join as Volunteer</button></li>
                <li><button onClick={() => navigate("/login?role=volunteer")} className="hover:text-white transition">Find Tasks</button></li>
                <li><button onClick={() => navigate("/login?role=volunteer")} className="hover:text-white transition">Leaderboard</button></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-3">Admins</p>
              <ul className="space-y-2 text-slate-500 text-xs">
                <li><button onClick={() => navigate("/login?role=admin")} className="hover:text-white transition">Dashboard</button></li>
                <li><button onClick={() => navigate("/login?role=admin")} className="hover:text-white transition">Analytics</button></li>
                <li><button onClick={() => navigate("/login?role=admin")} className="hover:text-white transition">Heatmap</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-xs text-slate-600 text-center">
            © 2026 JanSevak by codersx — Smart Citizens + Smart Governance = Better Communities
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;