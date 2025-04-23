import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { FaUserPlus } from "react-icons/fa";
import { IoRefreshOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { BACKEND_URL } from "../../config";

const RightPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedUser, setSuggestedUser] = useState([]);
  const [loadingFollows, setLoadingFollows] = useState({});
  const { socket } = useSocket();

  const fetchSuggest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/user/suggested", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSuggestedUser(data);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const followUser = async (id) => {
    try {
      // Set loading state for this specific user ID
      setLoadingFollows((prev) => ({ ...prev, [id]: true }));

      const ENDAPI = `http://localhost:8000/api/user/follow/${id}`;
      const response = await fetch(ENDAPI, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    } finally {
      // Clear loading state for this specific user ID
      setLoadingFollows((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchSuggest();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUsers = (users) => {
      setSuggestedUser(users);
    };

    socket.on("suggestedUsers", handleUsers);

    // Cleanup listener on unmount
    return () => {
      socket.off("suggestedUsers", handleUsers);
    };
  }, [socket]);

  return (
    <div className="hidden lg:block my-4 mx-4">
      <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 sticky top-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-blue-500 text-white p-4 font-bold text-lg flex justify-between items-center">
          <h3>Who to follow</h3>
        </div>

        <div className="p-4">
          <div className="flex flex-col">
            {/* Loading skeletons */}
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}

            {/* Suggested users */}
            {!isLoading &&
              suggestedUser.slice(0, 5)?.map((user) => (
                <div key={user._id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center justify-between gap-3 group"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full shadow-md transition-all duration-300 group-hover:ring-offset-4">
                          <img
                            src={user.profileImg || "/avatar-placeholder.png"}
                            alt={user.fullName}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-base group-hover:text-primary transition-colors duration-300">
                          {user.fullName}
                        </span>
                        <span className="text-sm text-base-content/60">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn text-white btn-primary btn-sm rounded-full px-4 shadow-md hover:shadow-lg transition-all duration-300 gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        followUser(user._id);
                      }}
                      disabled={loadingFollows[user._id]}
                    >
                      {loadingFollows[user._id] ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Loading
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="w-3 h-3" />
                          Follow
                        </>
                      )}
                    </button>
                  </Link>
                </div>
              ))}

            {/* Show more link */}
            {!isLoading && suggestedUser?.length > 0 && (
              <div className="pt-3">
                <Link
                  to="/explore"
                  className="text-primary hover:text-primary-focus hover:underline transition-all duration-300 font-medium text-sm"
                >
                  Show more
                </Link>
              </div>
            )}

            {!isLoading && (!suggestedUser || suggestedUser.length === 0) && (
              <div className="py-6 text-center text-base-content/70">
                <p>No suggestions available right now.</p>
                <button
                  className="btn btn-outline btn-primary btn-sm mt-2"
                  onClick={fetchSuggest}
                >
                  <IoRefreshOutline className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
