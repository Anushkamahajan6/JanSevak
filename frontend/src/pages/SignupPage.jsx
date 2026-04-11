import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SignUpImage from "../assets/signup.jpg"

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name,setName]=useState("");
  const [password, setPassword] = useState("");
  const handlesignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
      }
      alert("Signed up successfully");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Server Error");
    }
  };
  return (
    <div class="login-page">
    <div className="login-form-section">
        <form className="login-box" onSubmit={handlesignup}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Please signup to your account</p>
        <input
          type="name"
          placeholder="Enter your name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <input
          type="email"
          placeholder="Enter your Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      <p className="link-text">
            Already have a account?{" "}
            <span onClick={() => navigate("/")}>Login</span>
          </p>
          
      </form>
    </div>
    <div
              className="login-image"
              style={{ backgroundImage: `url(${SignUpImage})` }}
            >
              <div className="overlay">
                {/* <h1>Project Management System</h1>
          <p>Plan • Track • Collaborate</p> */}
              </div>
            </div>
    </div>
  );
}
export default Signup;
