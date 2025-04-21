import { User } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

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
const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:8000/api/user/suggested",
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setUsers(data);
        return data;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {}
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users; // If searchQuery is empty, return all users
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => <UserSkeleton key={index} />);
  };

  return (
    <div className="m-6 space-y-5">
      <div className="relative flex items-center">
        <FaSearch className="absolute left-5 text-secondary-contentx text-gray-500" />
        <input
          type="text"
          className="input w-full pl-12"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          placeholder="Search for users..."
        />
      </div>
      <div className="space-y-4">
        {isLoading ? (
          renderSkeletons()
        ) : filteredUsers.length > 0 ? (
          filteredUsers.slice(0, 6).map((user) => (
            <Link key={user._id} to={`/profile/${user._id}`}>
              <div className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-800">{user.username}</h3>
                  <p className="text-sm text-gray-500">
                    {user.email || "No email available"}
                  </p>
                </div>
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

export default ExplorePage;
