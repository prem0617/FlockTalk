"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaTrash,
} from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import useUser from "../../context/UserContext";

const PostCard = ({ postData }) => {
  const [post, setPost] = useState(postData);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { socket } = useSocket();
  const { user } = useUser();

  // const { data: user } = useQuery({ queryKey: ["authUser"] });

  // Check if post is liked by current user
  const isLiked = post?.likes?.includes(user?._id);

  // Check if post belongs to current user
  const isMyPost = user?._id === post?.user?._id;

  useEffect(() => {
    let isBookmarked = post?.bookmarks?.includes(user?._id);
    setIsBookmarked(isBookmarked);
  }, [post]);

  // Comment status for loader

  // Format date - could be enhanced with actual date formatting logic
  const formattedDate = "1h";

  // Delete post
  const deletePost = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/posts/delete/${post._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      throw new Error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const likePost = async () => {
    try {
      setIsLiking(true);
      const response = await fetch(
        `http://localhost:8000/api/posts/like/${post._id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      throw new Error(error);
    } finally {
      setIsLiking(false);
    }
  };

  const bookmark = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/posts/bookmark/${post._id}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  // Event handlers
  const handleDeletePost = () => {
    deletePost();
  };

  const handleLikePost = () => {
    likePost();
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    console.log(comment);
    // Add your comment posting logic here
    try {
      setIsCommenting(true);
      const response = await axios.post(
        `http://localhost:8000/api/posts/comment/${post._id}`,
        { text: comment },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsCommenting(false);
      setComment("");
    }
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    bookmark();
  };

  console.log(isBookmarked);

  useEffect(() => {
    const handleLikeUnlike = (data) => {
      if (post._id === data.id) {
        setPost((prev) => ({ ...prev, likes: data.likes }));
      }
    };

    const handleBookmark = (data) => {
      if (post._id === data.id) {
        console.log(data);
        setPost((prev) => ({ ...prev, bookmarks: data.bookmark }));
        setIsBookmarked(data.bookmark.includes(user._id));
      }
    };

    const handleComment = (data) => {
      // console.log(data);
      setPost((prev) => {
        const updatedComments = Array.isArray(prev.commnets)
          ? [data, ...prev.commnets] // Append new comment
          : [data]; // Initialize array if undefined

        const updatedPost = { ...prev, commnets: updatedComments };

        return updatedPost;
      });
    };
    socket.on("likeUnlikePost", handleLikeUnlike);
    socket.on("bookmark", handleBookmark);
    socket.on("comment", handleComment);

    return () => {
      socket.off("likeUnlikePost", handleLikeUnlike);
      socket.off("bookmark", handleBookmark);
      socket.off("comment", handleComment);
    };
  }, [post._id, user?._id]); // ✅ Remove `post` from dependencies
  console.log(post);
  return (
    <>
      {post && (
        <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-lg transition-all duration-300 my-3 mx-5">
          <div className="card-body p-5">
            <div className="flex gap-4">
              <Link to={`/profile/${post?.user?._id}`} className="avatar">
                <div className="w-12 h-12 rounded-full shadow-md">
                  <img
                    src={post?.user?.profileImg || "/avatar-placeholder.png"}
                    alt={post?.user?.fullName}
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/profile/${post?.user?._id}`}
                      className="font-semibold hover:underline text-base"
                    >
                      {user?.fullName}

                      <span className="text-base-content/70 text-sm">
                        @{post?.user.username}
                      </span>
                      <span className="text-base-content/70 text-sm">·</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMyPost && (
                      <button
                        className="btn btn-ghost btn-circle btn-sm hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                        onClick={handleDeletePost}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="whitespace-pre-wrap my-3 text-base">
                  {post.text}
                </p>

                {post.image && (
                  <div className="rounded-2xl overflow-hidden mt-3 border-2 border-base-200 shadow-md">
                    <img
                      src={post.image}
                      alt="Post image"
                      className="w-full object-cover max-h-[500px]"
                    />
                  </div>
                )}

                <div className="flex justify-between mt-4">
                  <button
                    className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300 rounded-full"
                    onClick={() =>
                      document
                        .getElementById(`comments_modal${post._id}`)
                        .showModal()
                    }
                  >
                    <FaRegComment className="w-4 h-4" />
                    <span className="text-xs">
                      {post.commnets?.length || 0}
                    </span>
                  </button>

                  <button
                    className={`btn btn-ghost btn-sm gap-2 rounded-full transition-all duration-300 ${
                      isLiked
                        ? "text-error hover:text-error/80 hover:bg-error hover:bg-opacity-10"
                        : "text-base-content/70 hover:text-error hover:bg-error hover:bg-opacity-10"
                    }`}
                    onClick={handleLikePost}
                    disabled={isLiking}
                  >
                    {isLiked ? (
                      <FaHeart className="w-4 h-4" />
                    ) : (
                      <FaRegHeart className="w-4 h-4" />
                    )}
                    <span className="text-xs">{post.likes?.length || 0}</span>
                  </button>

                  <button
                    className={`btn btn-ghost btn-sm rounded-full transition-all duration-300 ${
                      isBookmarked
                        ? "text-info hover:text-info/80 hover:bg-info hover:bg-opacity-10"
                        : "text-base-content/70 hover:text-info hover:bg-info hover:bg-opacity-10"
                    }`}
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? (
                      <FaBookmark className="w-4 h-4 fill-green-500" />
                    ) : (
                      <FaRegBookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Modal */}
          <dialog
            id={`comments_modal${post._id}`}
            className="modal border-none outline-none"
          >
            <div className="modal-box rounded border border-gray-600">
              <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
              <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                {(!post.commnets || post.commnets.length === 0) && (
                  <p className="text-sm text-slate-500">
                    No comments yet 🤔 Be the first one 😉
                  </p>
                )}
                {post?.commnets &&
                  post?.commnets.map((comment, index) => (
                    <div
                      key={comment._id || index}
                      className="flex gap-2 items-start"
                    >
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={
                              comment.user.profileImg ||
                              "/avatar-placeholder.png"
                            }
                            alt={comment.user.fullName}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">
                            {comment.user.fullName}
                          </span>
                          <span className="text-gray-700 text-sm">
                            @{comment.user.username}
                          </span>
                        </div>
                        <div className="text-sm">{comment.text}</div>
                      </div>
                    </div>
                  ))}
              </div>
              <form
                className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                onSubmit={handlePostComment}
              >
                <textarea
                  className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  className="btn btn-primary rounded-full btn-sm text-white px-4"
                  onClick={handlePostComment}
                >
                  {isCommenting ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    "Post"
                  )}
                </button>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button className="outline-none">close</button>
            </form>
          </dialog>
        </div>
      )}
    </>
  );
};

export default PostCard;
