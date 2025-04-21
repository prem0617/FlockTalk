import axios from "axios";
import { ArrowLeft, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const FollowersUsers = () => {
  const { id } = useParams();

  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserFollowers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/user/getFollowersUsers/${id}`,
        { withCredentials: true }
      );
      console.log(response);
      setFollowers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredUsers = searchQuery
    ? followers.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followers;

  useEffect(() => {
    fetchUserFollowers();
  }, []);

  return (
    <div className="mx-5">
      <h2 className="bg-blue-500 mt-4  text-white font-bold p-4 rounded-t-md text-xl flex items-center gap-4">
        <Link to={`/profile/${id}`}>
          <ArrowLeft />
        </Link>{" "}
        Followers Users
      </h2>
      <div className="bg-white rounded-b-md shadow-md">
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
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={index}
              className="flex border-b border-gray-100 py-4 text-center items-center"
            >
              <p className="bg-blue-100 w-12 h-12 rounded-full flex justify-center items-center text-blue-500 font-bold mx-4">
                {user.username.charAt(0).toUpperCase()}
              </p>
              <div className="flex flex-col items-start">
                <p>{user.fullname}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))
        ) : (
          <div>User is not Follwoing anyone</div>
        )}
      </div>
    </div>
  );
};

export default FollowersUsers;
