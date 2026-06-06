// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import { useState } from "react";
// import { ArrowLeft } from "lucide-react";
// import SignUpImage from "../assets/signup.jpg"

// function Signup() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const roleParam = searchParams.get("role");
//   const [selectedRole, setSelectedRole] = useState(roleParam || null);
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");

//   const roles = [
//     { id: "user", title: "Citizen", icon: "👤" },
//     { id: "volunteer", title: "Volunteer", icon: "🤝" },
//     { id: "admin", title: "Admin / NGO", icon: "🔐" }
//   ];
//   const handlesignup = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/auth/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ name, email, password, role: selectedRole }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.message);
//       }
//       alert("Signed up successfully. Please login to your account.");
//       navigate(`/login?role=${selectedRole}`);
//     } catch (err) {
//       console.log(err);
//       alert("Server Error");
//     }
//   };

//   const getRoleLabel = (role) => {
//     const roleMap = { user: "Citizen", volunteer: "Volunteer", admin: "Admin" };
//     return roleMap[role] || role;
//   };

//   // Signup Form View
//   return (
//     <div className="login-page">
//     <div className="login-form-section">
//         <form className="login-box" onSubmit={handlesignup}>
//           <button
//             type="button"
//             onClick={() => setSelectedRole(null)}
//             className="back-button flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700 font-semibold"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back
//           </button>
//           <h2>Create Account</h2>
//           <p className="subtitle">Sign up as {getRoleLabel(selectedRole)}</p>
//         <input
//           type="name"
//           placeholder="Enter your name"
//           required
//           value={name}
//           onChange={(e) => {
//             setName(e.target.value);
//           }}
//         />
//         <input
//           type="email"
//           placeholder="Enter your Email"
//           required
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Enter your Password"
//           required
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">Sign Up</button>
//       <p className="link-text">
//             Already have a account?{" "}
//             <span onClick={() => navigate(`/login?role=${selectedRole}`)}>Login</span>
//           </p>
          
//       </form>
//     </div>
//     <div
//               className="login-image"
//               style={{ backgroundImage: `url(${SignUpImage})` }}
//             >
//               <div className="overlay">
//                 {/* <h1>Project Management System</h1>
//           <p>Plan • Track • Collaborate</p> */}
//               </div>
//             </div>
//     </div>
//   );
// }
// export default Signup;


import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") || null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "user", title: "Citizen", sub: "Report and track civic issues" },
    { id: "volunteer", title: "Volunteer", sub: "Help resolve community issues" },
    { id: "admin", title: "Admin / NGO", sub: "Manage issues and volunteers" },
  ];

  const getRoleLabel = (role) =>
    ({ user: "Citizen", volunteer: "Volunteer", admin: "Admin" }[role] || role);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); setLoading(false); return; }
      navigate(`/login?role=${selectedRole}`);
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center p-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-10 text-slate-400 hover:text-white text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white mx-auto mb-4">J</div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-slate-400 text-sm">Select your role to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/10 hover:border-white/20 transition"
            >
              <p className="font-semibold text-white text-sm mb-1">{role.title}</p>
              <p className="text-xs text-slate-400">{role.sub}</p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-slate-500 text-sm">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">
            Login
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white text-sm mb-4">J</div>
            <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm">Sign up as {getRoleLabel(selectedRole)}</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-5 text-center text-slate-500 text-xs">
            Already have an account?{" "}
            <span onClick={() => navigate(`/login?role=${selectedRole}`)} className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;