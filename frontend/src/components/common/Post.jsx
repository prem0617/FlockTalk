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
import { BACKEND_URL } from "../../config";

const PostCard = ({ postData }) => {
  const [post, setPost] = useState(postData);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { socket } = useSocket();
  const { user } = useUser();

  // Check if post is liked by current user
  const isLiked = post?.likes?.includes(user?._id);

  // Check if post belongs to current user
  const isMyPost = user?._id === post?.user?._id;

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

  // Event handlers
  const handleDeletePost = () => {
    deletePost();
  };

  const handleLikePost = () => {
    likePost();
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

  const handleBookmark = (e) => {
    e.preventDefault();
    bookmark();
  };

  useEffect(() => {
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
  }, [post._id, user?._id]);

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
                        onClick={handleDeletePost}
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
                    onClick={() =>
                      document
                        .getElementById(`comments_modal${post._id}`)
                        .showModal()
                    }
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
                    onClick={handleLikePost}
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
                    onClick={handleBookmark}
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

          {/* Comments Modal */}
          <dialog
            id={`comments_modal${post._id}`}
            className="modal border-none outline-none"
          >
            <div className="modal-box w-11/12 max-w-md md:max-w-lg rounded border border-gray-600">
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">
                COMMENTS
              </h3>
              <div className="flex flex-col gap-2 md:gap-3 max-h-40 md:max-h-60 overflow-auto">
                {(!post.commnets || post.commnets.length === 0) && (
                  <p className="text-xs md:text-sm text-slate-500">
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
                        <div className="w-6 md:w-8 rounded-full">
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
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-xs md:text-sm">
                            {comment.user.fullName}
                          </span>
                          <span className="text-gray-700 text-xs">
                            @{comment.user.username}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm break-words">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <form
                className="flex gap-2 items-center mt-3 md:mt-4 border-t border-gray-600 pt-2"
                onSubmit={handlePostComment}
              >
                <textarea
                  className="textarea w-full p-1 rounded text-xs md:text-sm resize-none border focus:outline-none border-gray-800"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                />
                <button
                  className="btn btn-primary rounded-full btn-xs md:btn-sm text-white px-2 md:px-4"
                  type="submit"
                  disabled={!comment.trim() || isCommenting}
                >
                  {isCommenting ? (
                    <span className="loading loading-spinner loading-xs md:loading-md"></span>
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
