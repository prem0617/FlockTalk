import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaBookmark, FaSearch, FaFeatherAlt } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { BsChat } from "react-icons/bs";
import useUser from "../../context/UserContext";
import axios from "axios";
import { BACKEND_URL } from "../../config";

const Sidebar = () => {
  const location = useLocation();
  const { user, loading, setUser } = useUser();
  const navigate = useNavigate();

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/logout`, {
        withCredentials: true,
      });

      console.log(response);
      if (response.status === 200) {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: MdHomeFilled,
      exact: true,
    },
    {
      path: "/explore",
      label: "Explore",
      icon: FaSearch,
    },
    {
      path: "/notification",
      label: "Notifications",
      icon: IoNotifications,
    },
    {
      path: "/messages",
      label: "Messages",
      icon: BsChat,
    },
    {
      path: "/bookmarks",
      label: "Bookmarks",
      icon: FaBookmark,
    },
    {
      path: `/profile/${user?._id}`,
      label: "Profile",
      icon: FaUser,
    },
  ];

  return (
    <div className="w-20 sm:w-24 md:flex-[2_2_0] md:w-auto md:max-w-52 lg:max-w-64 border-r border-gray-200">
      <div className="sticky top-0 left-0 flex flex-col h-screen pt-2 sm:pt-4">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-3 sm:px-4 mb-4 sm:mb-8 hidden md:block">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-500">
              <span className="flex items-center gap-2">
                FlockTalk
                <FaFeatherAlt className="w-4 sm:w-5 h-4 sm:h-5" />
              </span>
            </h1>
          </div>

          {/* Mobile Logo */}
          <div className="px-2 sm:px-4 mb-4 sm:mb-6 md:hidden flex justify-center">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <FaFeatherAlt className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex flex-col items-center justify-center md:block mb-4 sm:mb-8 px-1 sm:px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-200 ${
                    active
                      ? "text-blue-500 font-medium bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      active ? "text-blue-500" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base hidden md:block ${
                      active ? "font-medium" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          {loading ? (
            <div className="mt-auto mb-4 sm:mb-6 px-2 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="hidden md:block flex-1">
                  <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded animate-pulse mb-1 sm:mb-2"></div>
                  <div className="h-1 sm:h-2 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            user && (
              <div className="mt-auto mb-4 sm:mb-6">
                <button
                  className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-full hover:bg-gray-100 transition-all duration-200"
                  onClick={(e) => {
                    if (e.target.closest("[data-logout]")) {
                      e.preventDefault();
                      handleLogout();
                    }
                  }}
                >
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={user?.profileImg || "/avatar-placeholder.png"}
                        alt={user?.fullname || "User"}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1 text-left hidden md:block">
                    <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] text-gray-800">
                      {user?.fullname || user?.username}
                    </p>
                    <p className="text-gray-500 text-xs">@{user?.username}</p>
                  </div>

                  <button
                    data-logout
                    className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                  >
                    <BiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
