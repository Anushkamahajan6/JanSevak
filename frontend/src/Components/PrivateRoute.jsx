import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#312e81)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px"
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login${requiredRole ? `?role=${requiredRole}` : ""}`} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/login?role=${requiredRole}`} replace />;
  }

  return children;
}

export default PrivateRoute;