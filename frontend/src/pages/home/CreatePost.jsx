import { useRef, useState } from "react";
import axios from "axios";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { FiSend } from "react-icons/fi";
import useUser from "../../context/UserContext";

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
        "http://localhost:8000/api/posts/create",
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

      console.log("Post created:", response.data);
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
    <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-lg transition-all duration-300">
      <div className="card-body p-5">
        <div className="flex items-start gap-4">
          <div className="avatar online">
            <div className="w-12 h-12 rounded-full shadow-md">
              <img
                src={authUser?.profileImg || "/avatar-placeholder.png"}
                alt="Profile"
                className="object-cover"
              />
            </div>
          </div>

          <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                className="textarea textarea-lg w-full min-h-[100px] text-base resize-none focus:outline-none border-2 border-base-200 focus:border-primary rounded-2xl px-4 py-3 transition-all duration-300 bg-base-100"
                placeholder=" "
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <label
                className={`absolute text-base-content/60 transition-all duration-300 ${
                  text ? "" : "text-base top-4 left-4"
                }`}
              >
                What's happening?
              </label>
            </div>

            {imgPreview && (
              <div className="relative rounded-2xl overflow-hidden bg-base-200 max-w-md mx-auto border-2 border-base-300 shadow-md">
                <button
                  type="button"
                  className="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100 bg-opacity-90 hover:bg-base-100 border-none shadow-md"
                  onClick={() => {
                    setImg(null);
                    setImagePreview(null);
                    if (imgRef.current) imgRef.current.value = null;
                  }}
                >
                  <IoCloseSharp className="w-4 h-4" />
                </button>
                <img
                  src={imgPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain"
                />
              </div>
            )}

            <div className="divider my-1"></div>

            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-circle btn-ghost text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300"
                  onClick={() => imgRef.current.click()}
                >
                  <CiImageOn className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-ghost text-primary hover:bg-primary hover:bg-opacity-10 transition-all duration-300"
                >
                  <BsEmojiSmileFill className="w-5 h-5" />
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
                } btn-md rounded-full text-white px-8 shadow-md hover:shadow-lg transition-all duration-300 gap-2`}
                disabled={isSubmitting || (!text && !img)}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="alert alert-error mt-2 py-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-4 w-4"
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
