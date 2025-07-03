import React, { useState } from "react";
import useUser from "../../context/UserContext";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { BACKEND_URL } from "../../config";

const Comment = ({ comment, post }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useUser();
  const handleDeleteComment = async (id) => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${BACKEND_URL}/api/posts/deleteComment/${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <div
      key={comment._id}
      className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
    >
      <div className="flex justify-center items-center w-full">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={comment.user.profileImg || "/avatar-placeholder.png"}
              alt={comment.user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {comment.user.fullName}
            </span>
            <span className="text-xs text-gray-500">
              @{comment.user.username}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-800 break-words flex-1 ml-4">
              {comment.text}
            </p>
          </div>
        </div>
        {(post.user._id === user._id || comment.user._id === user._id) && (
          <button
            onClick={() => handleDeleteComment(comment._id)}
            className="p-2 min-w-[40px] min-h-[40px] text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 flex items-center justify-center"
            title="Delete comment"
          >
            {deleteLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FaTrash className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment;
