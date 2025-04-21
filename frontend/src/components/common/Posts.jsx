import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import useUser from "../../context/UserContext";

const Posts = ({ feedType, userId }) => {
  const { user } = useUser();
  const { socket } = useSocket();

  const [posts, setPosts] = useState([]);
  const [isFetchPostLoading, setIsFetchPostLoading] = useState(false);

  let id;

  if (user) {
    id = user?._id;
  }

  const getApiEndPosint = () => {
    if (feedType === "forYou") {
      return "http://localhost:8000/api/posts/getAllPost";
    } else if (feedType === "following") {
      return "http://localhost:8000/api/posts/following";
    } else if (feedType === "likes") {
      return `http://localhost:8000/api/posts/getLikedPost/${id}`;
    } else if (feedType === "posts") {
      return `http://localhost:8000/api/posts/userPost/${userId}`;
    } else if (feedType === "bookmarks") {
      return "http://localhost:8000/api/posts/getBookmark";
    } else {
      return "http://localhost:8000/api/posts/all";
    }
  };

  const APIENDPOINT = getApiEndPosint();

  const fetchPosts = async () => {
    try {
      setIsFetchPostLoading(true);
      const respose = await fetch(APIENDPOINT, { credentials: "include" });

      // console.log(respose);
      if (!respose.ok) throw new Error(error.message);

      const data = await respose.json();
      // console.log(data);
      if (data.error) throw new Error(data.error || "Error in Fetching Post");

      setPosts(data);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    } finally {
      setIsFetchPostLoading(false);
    }
  };

  // console.log(posts);

  useEffect(() => {
    fetchPosts();
  }, [feedType, userId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newPost", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post at top
    });

    socket.on("deletePost", (id) => {
      setPosts((prevPosts) => {
        const filteredPosts = prevPosts.filter((p) => p._id !== id);
        return filteredPosts;
      });
    });

    return () => {
      socket.off("newPost");
      socket.off("deletePost");
    };
  }, [socket]);

  return (
    <>
      {isFetchPostLoading ? (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <Post key={post._id} postData={post} />
          ))}
        </div>
      ) : (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
    </>
  );
};
export default Posts;
