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

// ...imports remain unchanged...

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

  const deleteNotifications = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/notification`, {
        withCredentials: true,
      });
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
      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async ({ e, id }) => {
    e.preventDefault();
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/api/notification/${id}`,
        {
          withCredentials: true,
        }
      );
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

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    const handleDeleteSocket = (notification) => {
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
    };

    socket.on("notification", handleNotification);
    socket.on("deleteNotification", handleDeleteSocket);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("deleteNotification", handleDeleteSocket);
    };
  }, [socket]);

  return (
    <div className="flex-1 w-full max-w-full border-l border-r border-gray-200 min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h1 className="font-bold text-xl text-gray-900">Notifications</h1>
        <div className="relative">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle btn-sm hover:bg-gray-100 transition-colors duration-200"
            >
              <IoSettingsOutline className="w-5 h-5 text-gray-600" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-box w-48 border border-gray-200"
            >
              <li>
                <a
                  onClick={deleteNotifications}
                  className="text-base text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Delete all notifications
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center h-64 items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-center p-12">
          <div className="text-5xl mb-4">🤔</div>
          <p className="font-bold text-lg text-gray-600">No notifications</p>
          <p className="text-base text-gray-500 mt-2">
            When you get notifications, they'll show up here
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading &&
        notifications.map((notification) => (
          <div
            key={notification._id}
            className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex gap-3 p-4 items-start">
              {/* Notification Icon */}
              <div className="flex-shrink-0">
                {notification.type === "follow" && (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                {notification.type === "like" && (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <FaHeart className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${notification.from._id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 transition-colors duration-200">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                        alt={`${notification.from.username}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                        <span className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                          @{notification.from.username}
                        </span>
                        <span className="text-sm text-gray-600">
                          {notification.type === "COMMENT"
                            ? "commented on your post"
                            : notification.type === "FOLLOW"
                            ? "started following you"
                            : "liked your post"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(
                          [],
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Delete Button */}
              <div className="flex-shrink-0">
                <button
                  className="btn btn-ghost btn-circle btn-sm hover:bg-red-100 hover:text-red-500 transition-all duration-300 text-gray-400"
                  onClick={(e) =>
                    handleDeleteNotification({ e, id: notification._id })
                  }
                  aria-label="Delete notification"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default NotificationPage;
