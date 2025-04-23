import { useRef, useState } from "react";
import axios from "axios";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import useUser from "../../context/UserContext";
import { BACKEND_URL } from "../../config";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgPreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const imgRef = useRef(null);

  const { user: authUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();

    if (text) formData.append("text", text);
    if (img) formData.append("image", img);

    const isOnlyText = text && !img;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/posts/create`,
        isOnlyText ? { text } : formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": isOnlyText
              ? "application/json"
              : "multipart/form-data",
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setText("");
      setImg(null);
      setImagePreview(null);
      if (imgRef.current) imgRef.current.value = null;
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImg(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-lg transition-all duration-300 mx-1 sm:mx-2 md:mx-5">
      <div className="card-body p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          <div className="avatar online">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md">
              <img
                src={authUser?.profileImg || "/avatar-placeholder.png"}
                alt="Profile"
                className="object-cover"
              />
            </div>
          </div>

          <form
            className="flex flex-col gap-2 sm:gap-3 w-full"
            onSubmit={handleSubmit}
          >
            <div className="relative">
              <textarea
                className="textarea w-full min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none focus:outline-none border-2 border-base-200 focus:border-primary rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 transition-all duration-300 bg-base-100"
                placeholder="What's happening?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Post content"
              />
            </div>

            {imgPreview && (
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-base-200 max-w-full sm:max-w-md mx-auto border border-base-300 shadow-md">
                <button
                  type="button"
                  className="btn btn-circle btn-xs sm:btn-sm absolute top-1 sm:top-2 right-1 sm:right-2 bg-base-100 bg-opacity-90 hover:bg-base-100 border-none shadow-md"
                  onClick={() => {
                    setImg(null);
                    setImagePreview(null);
                    if (imgRef.current) imgRef.current.value = null;
                  }}
                >
                  <IoCloseSharp className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <img
                  src={imgPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-h-[200px] sm:max-h-[300px] object-contain"
                />
              </div>
            )}

            <div className="divider my-0 sm:my-1"></div>

            <div className="flex justify-between items-center">
              <div className="flex gap-1 sm:gap-3">
                <button
                  type="button"
                  className="btn btn-circle btn-xs sm:btn-sm md:btn-md btn-ghost text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300"
                  onClick={() => imgRef.current.click()}
                  aria-label="Add image"
                >
                  <CiImageOn className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-xs sm:btn-sm md:btn-md btn-ghost text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300"
                  aria-label="Add emoji"
                >
                  <BsEmojiSmileFill className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <input
                type="file"
                hidden
                ref={imgRef}
                onChange={handleImgChange}
                accept="image/*"
              />

              <button
                type="submit"
                className={`btn ${
                  isSubmitting || (!text && !img)
                    ? "btn-disabled"
                    : "btn-primary"
                } btn-xs sm:btn-sm md:btn-md rounded-full text-white px-3 sm:px-5 md:px-8 shadow-md hover:shadow-lg transition-all duration-300 gap-1 sm:gap-2`}
                disabled={isSubmitting || (!text && !img)}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="hidden xs:inline">Posting...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Post</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="alert alert-error mt-1 sm:mt-2 py-1 sm:py-2 text-xs sm:text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-3 w-3 sm:h-4 sm:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
