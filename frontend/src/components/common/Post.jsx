import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaTrash,
  FaTrashAlt,
  FaTimes,
} from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import useUser from "../../context/UserContext";
import { BACKEND_URL } from "../../config";
import Comment from "./Comment";

const PostCard = ({ postData }) => {
  const [post, setPost] = useState(postData);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [displayComments, setDisplayComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { socket } = useSocket();
  const { user } = useUser();

  // Check if post is liked by current user
  const isLiked = post?.likes?.includes(user?._id);

  // Check if post belongs to current user
  const isMyPost = user?._id === post?.user?._id;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (displayComments) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [displayComments]);

  useEffect(() => {
    let isBookmarked = post?.bookmarks?.includes(user?._id);
    setIsBookmarked(isBookmarked);
  }, [post]);

  // Format date - could be enhanced with actual date formatting logic
  const formattedDate = "1h";

  // Delete post
  const deletePost = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/posts/delete/${post._id}`,
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
        `${BACKEND_URL}/api/posts/like/${post._id}`,
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
        `${BACKEND_URL}/api/posts/bookmark/${post._id}`,
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

  const handlePostComment = async (e) => {
    e.preventDefault();
    try {
      setIsCommenting(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/posts/comment/${post._id}`,
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

  const closeModal = () => {
    setDisplayComments(false);
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  useEffect(() => {
    if (!socket) return;
    function handleDeleteComment(deletedComment) {
      setPost((prev) => {
        const updatedComments = prev.commnets?.filter(
          (c) => c._id !== deletedComment._id
        );

        return {
          ...prev,
          commnets: updatedComments,
        };
      });
    }

    socket.on("deleteComment", handleDeleteComment);

    return () => {
      socket.off("deleteComment", handleDeleteComment);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleLikeUnlike = (data) => {
      if (post._id === data.id) {
        setPost((prev) => ({ ...prev, likes: data.likes }));
      }
    };

    const handleBookmark = (data) => {
      if (post._id === data.id) {
        setPost((prev) => ({ ...prev, bookmarks: data.bookmark }));
        setIsBookmarked(data.bookmark.includes(user._id));
      }
    };

    const handleComment = (data) => {
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
  }, [post._id, user?._id, socket]);

  return (
    <>
      {post && (
        <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-lg transition-all duration-300 my-2 md:my-3 mx-1 md:mx-5">
          <div className="card-body p-3 md:p-5">
            <div className="flex gap-2 md:gap-4">
              <Link to={`/profile/${post?.user?._id}`} className="avatar">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md">
                  <img
                    src={post?.user?.profileImg || "/avatar-placeholder.png"}
                    alt={post?.user?.fullName}
                    className="object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-1 md:gap-1.5">
                    <Link
                      to={`/profile/${post?.user?._id}`}
                      className="font-semibold hover:underline text-sm md:text-base truncate max-w-full sm:max-w-xs"
                    >
                      {user?.fullName}
                    </Link>
                    <span className="text-base-content/70 text-xs sm:text-sm truncate">
                      @{post?.user.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 sm:mt-0">
                    {isMyPost && (
                      <button
                        className="btn btn-ghost btn-circle btn-xs sm:btn-sm hover:bg-red-100 hover:text-red-500 transition-all duration-300"
                        onClick={deletePost}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                        ) : (
                          <FaTrash className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="whitespace-pre-wrap my-2 md:my-3 text-sm md:text-base break-words">
                  {post.text}
                </p>

                {post.image && (
                  <div className="rounded-lg md:rounded-2xl overflow-hidden mt-2 md:mt-3 border border-base-200 shadow-md">
                    <img
                      src={post.image}
                      alt="Post image"
                      className="w-full object-cover max-h-[300px] md:max-h-[500px]"
                    />
                  </div>
                )}

                <div className="flex justify-between mt-3 md:mt-4">
                  <button
                    className="btn btn-ghost btn-xs md:btn-sm gap-1 md:gap-2 text-base-content/70 hover:text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300 rounded-full"
                    onClick={() => setDisplayComments(true)}
                  >
                    <FaRegComment className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs">
                      {post.commnets?.length || 0}
                    </span>
                  </button>

                  <button
                    className={`btn btn-ghost btn-xs md:btn-sm gap-1 md:gap-2 rounded-full transition-all duration-300 ${
                      isLiked
                        ? "text-error hover:text-error/80 hover:bg-error hover:bg-opacity-10"
                        : "text-base-content/70 hover:text-error hover:bg-error hover:bg-opacity-10"
                    }`}
                    onClick={likePost}
                    disabled={isLiking}
                  >
                    {isLiked ? (
                      <FaHeart className="w-3 h-3 md:w-4 md:h-4" />
                    ) : (
                      <FaRegHeart className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                    <span className="text-xs">{post.likes?.length || 0}</span>
                  </button>

                  <button
                    className={`btn btn-ghost btn-xs md:btn-sm rounded-full transition-all duration-300 ${
                      isBookmarked
                        ? "text-info hover:text-info/80 hover:bg-info hover:bg-opacity-10"
                        : "text-base-content/70 hover:text-info hover:bg-info hover:bg-opacity-10"
                    }`}
                    onClick={bookmark}
                  >
                    {isBookmarked ? (
                      <FaBookmark className="w-3 h-3 md:w-4 md:h-4 fill-green-500" />
                    ) : (
                      <FaRegBookmark className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {displayComments && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={handleBackdropClick}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">Comments</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaTimes className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {(!post.commnets || post.commnets.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    </div>
                  )}
                  {post.commnets?.map((comment) => (
                    <Comment key={comment.id} comment={comment} post={post} />
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handlePostComment} className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                      disabled={!comment.trim() || isCommenting}
                    >
                      {isCommenting ? "Posting..." : "Post"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PostCard;
