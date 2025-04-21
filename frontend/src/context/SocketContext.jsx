import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import useUser from "./UserContext";

export const SocketContext = createContext(null);

const SocketContextProvider = ({ children }) => {
  const { user, loading } = useUser();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (loading || !user) return;

    const newSocket = io("http://localhost:8000", {
      query: { userId: user._id },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server as", user.username);
      setSocket(newSocket);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user, loading]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) return { socket: null, onlineUsers: [] }; // Prevent errors if context is not available

  return context;
};
