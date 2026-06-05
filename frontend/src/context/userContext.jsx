import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        credentials: "include",
      });
      if (!res.ok) { setLoading(false); return; }
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