import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaTrash, FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-hot-toast";
import { BACKEND_URL } from "../../config";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  const deleteNotifications = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/notification`, {
        withCredentials: true,
      });
      console.log(response);
      if (response.status === 200) {
        toast.success("Notification deleted");
      }
      fetchNotification();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotification = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/notification`, {
        withCredentials: true,
      });
      console.log(response);
      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (data) => {
    const { e, id } = data;
    e.preventDefault();
    // console.log(data);

    try {
      const response = await axios.delete(
        `${BACKEND_URL}/api/notification/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log(response);
      if (response.status === 200) {
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  // useEffect for Socket

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      // console.log(notification);
      setNotifications((prevNotification) => [
        notification,
        ...prevNotification,
      ]);
    };
    socket.on("notification", handleNotification);
    socket.on("deleteNotification", (notification) => {
      // console.log(notification);
      setNotifications((prevNotification) => {
        return prevNotification.filter((n) => n._id !== notification._id);
      });
    });

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4 justify-between">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              <Link to={`/profile/${notification.from._id}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>{" "}
                  {notification.type === "COMMENT"
                    ? "Comment on your post"
                    : notification.type === "FOLLOW"
                    ? "Stared following you"
                    : "liked your post"}
                </div>
              </Link>
              <div>
                <button
                  className="btn btn-ghost btn-circle btn-sm hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                  onClick={(e) =>
                    handleDeleteNotification({ e, id: notification._id })
                  }
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
