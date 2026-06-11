import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem("jansevak_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("jansevak_user");
  });

  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem("jansevak_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("jansevak_user");
      localStorage.removeItem("jansevak_token");
    }
    setUserState(userData);
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("jansevak_token");
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setUser(null); return; }
      const data = await res.json();
      setUser({ id: data.userId, name: data.name, email: data.email, role: data.role });
    } catch (err) {
      console.warn("Profile fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);