import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load saved user on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("navideo_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login → save user + token in localStorage
  const login = (userData) => {
    localStorage.setItem("navideo_user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout → remove from localStorage
  const logout = () => {
    localStorage.removeItem("navideo_user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
