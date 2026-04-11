import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        // ❗ Don't instantly log out on 401
        setLoading(false);
        return;
      }

      const data = await res.json();

      setUser({
        id: data.userId,
        role: data.role,
      });

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⏳ small delay to allow cookie to be available
    const timer = setTimeout(() => {
      fetchUser();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);