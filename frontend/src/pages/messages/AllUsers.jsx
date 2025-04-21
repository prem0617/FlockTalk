import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, User } from "lucide-react";
import useUser from "../../context/UserContext";

// Skeleton component for loading state
const UserSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-100">
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};

const AllUsers = () => {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useUser();

  // console.log(user);

  const getUserChats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/message/chatUsrs`,
        { withCredentials: true }
      );
      // console.log(response);
      setFollowingUsers(response.data);
      return response.data;
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserChats();
  }, []);

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? followingUsers.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followingUsers;

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => <UserSkeleton key={index} />);
  };

  return (
    <div className="ml-5 mt-5 mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-500 text-white">
        <h1 className="text-xl font-bold">My Conversations</h1>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[70vh]">
        {isLoading ? (
          renderSkeletons()
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Link key={user._id} to={`/message/${user._id}`}>
              <div className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-800">{user.username}</h3>
                </div>
                <MessageSquare size={18} className="text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <User size={48} className="text-gray-300 mb-2" />
            <h3 className="text-gray-500 font-medium">No users found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? "Try a different search"
                : "You're not following anyone yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
