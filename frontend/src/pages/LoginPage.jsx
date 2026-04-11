import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/userContext";
import "../styles/style.css";
import loginImage from "../assets/login.jpeg";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser(); // ✅ use setUser directly

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlelogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Login successful");

      // ✅ SET USER IMMEDIATELY (no waiting for profile API)
      setUser({
        id: data.user.id,
        role: data.user.role,
      });

      // ✅ Navigate
      if (data.user.role === "user") {
        navigate("/user");
      } else {
        navigate("/admin");
      }

    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-image"
        style={{ backgroundImage: `url(${loginImage})` }}
      >
        <div className="overlay"></div>
      </div>

      <div className="login-form-section">
        <form className="login-box" onSubmit={handlelogin}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Please login to your account</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="options-row">
            <label className="remember-me">
              <input type="checkbox" />
              <span className="checkmark"></span>
              <span className="remember-text">Remember me</span>
            </label>

            <span
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <button type="submit">Login</button>

          <p className="link-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Signup</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;