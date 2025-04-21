import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // This useEffect syncs user state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]); // This runs whenever the user state changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(response.data);
        // No need to manually set localStorage here anymore
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        // No need to manually remove from localStorage here anymore
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      // No need to manually remove from localStorage here anymore
    }
  };

  // Create a custom setter that wraps the original setUser
  const updateUser = (userData) => {
    if (typeof userData === "function") {
      setUser((prevUser) => {
        const newUserData = userData(prevUser);
        return newUserData;
      });
    } else {
      setUser(userData);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser: updateUser, loading, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};

export default useUser;
