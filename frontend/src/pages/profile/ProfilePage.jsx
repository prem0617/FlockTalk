import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import axios from "axios";
import useUser from "../../context/UserContext";
import { Loader2 } from "lucide-react";
import { BACKEND_URL } from "../../config";

const ProfilePage = () => {
  const { id } = useParams();
  const { user: loggedInUser } = useUser();

  const [isCoverPageUploading, setIsCoverPageUploading] = useState(false);
  const [isProfilePageUploading, setIsProfilePageUploading] = useState(false);
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImg, setCoverImg] = useState(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [previewCoverImg, setPreviewCoverImg] = useState(null);
  const [previewProfileImg, setPreviewProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];

    if (file) {
      if (state === "coverImg") {
        setCoverImg(file);
        setPreviewCoverImg(URL.createObjectURL(file));
      }
      if (state === "profileImg") {
        setProfileImg(file);
        setPreviewProfileImg(URL.createObjectURL(file));
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (profileImg) {
      formData.append("profile", profileImg);
      setIsProfilePageUploading(true);
    }
    if (coverImg) {
      formData.append("cover", coverImg);
      setIsCoverPageUploading(true);
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/user/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsCoverPageUploading(false);
      setIsProfilePageUploading(false);
    }
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/user/${id}`, {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (data) => {
    const { e, id } = data;
    e.preventDefault();
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/follow/${id}`, {
        withCredentials: true,
      });
      if (response.data.follow) setIsUserFollowing(true);
      else setIsUserFollowing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    setIsMyProfile(id === loggedInUser._id);

    const isFollowing = user?.followers?.includes(loggedInUser._id);
    if (isFollowing) setIsUserFollowing(true);
    else setIsUserFollowing(false);
  }, [isLoading, user]);

  return (
    <>
      <div className="flex-[4_4_0] min-h-screen w-full max-w-4xl mx-auto px-4 md:px-6">
        {/* Page Heading */}
        <h1 className="text-2xl font-bold text-center py-4 border-b mb-2 md:hidden">
          Profile
        </h1>

        {/* Desktop Heading */}
        <h1 className="text-2xl font-bold hidden md:block py-4 border-b mb-2">
          Profile
        </h1>

        {/* HEADER */}
        {isLoading && <ProfileHeaderSkeleton />}
        {!isLoading && !user && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && user && (
            <>
              <div className="flex gap-4 md:gap-10 px-2 md:px-4 py-2 items-center">
                <Link
                  to="/"
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.fullName}</p>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={previewCoverImg || user?.coverImg || "/cover.png"}
                  className="h-32 sm:h-40 md:h-52 w-full object-cover rounded-md"
                  alt="cover image"
                />
                {isMyProfile &&
                  (isCoverPageUploading ? (
                    <div
                      className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                      onClick={() => coverImgRef.current.click()}
                    >
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  ) : (
                    <div
                      className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                      onClick={() => coverImgRef.current.click()}
                    >
                      <MdEdit className="w-5 h-5 text-white" />
                    </div>
                  ))}

                <input
                  type="file"
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-12 sm:-bottom-14 md:-bottom-16 left-4">
                  <div className="w-16 sm:w-28 md:w-32 rounded-full relative group/avatar ring-4 ring-white">
                    <img
                      src={
                        previewProfileImg ||
                        user?.profileImg ||
                        "/avatar-placeholder.png"
                      }
                      alt={`${user?.fullName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                    {isMyProfile && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        {isProfilePageUploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <MdEdit
                            className="w-6 h-6 text-white"
                            onClick={() => profileImgRef.current.click()}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 px-4 mt-2 sm:mt-3 md:mt-5">
                <div className="flex-1"></div>{" "}
                {/* Spacer for profile name positioning */}
                <div className="flex flex-wrap gap-2 justify-end mt-10 sm:mt-0">
                  {isMyProfile && <EditProfileModal />}
                  {!isMyProfile && (
                    <button
                      className="btn btn-outline rounded-full btn-sm"
                      onClick={(e) => handleFollow({ e, id })}
                    >
                      {isUserFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                  {(coverImg || profileImg) && (
                    <button
                      className="btn btn-primary rounded-full btn-sm text-white px-4"
                      onClick={handleProfileUpdate}
                    >
                      Update
                    </button>
                  )}
                  <Link to={`/message/${id}`}>
                    <button className="btn btn-outline rounded-full btn-sm">
                      Message
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8 sm:mt-12 md:mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.fullName}</span>
                  <span className="text-sm text-slate-500">
                    @{user?.username}
                  </span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center">
                      <FaLink className="w-3 h-3 text-slate-500" />
                      <a
                        href={user?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline break-all"
                      >
                        {user.link}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Link to={`/following/${id}`}>
                    <button className="flex gap-1 items-center hover:underline">
                      <span className="font-bold text-xs md:text-sm">
                        {user?.following.length}
                      </span>
                      <span className="text-slate-500 text-xs md:text-sm">
                        Following
                      </span>
                    </button>
                  </Link>
                  <Link to={`/followers/${id}`}>
                    <button className="flex gap-1 items-center hover:underline">
                      <span className="font-bold text-xs md:text-sm">
                        {user?.followers.length}
                      </span>
                      <span className="text-slate-500 text-xs md:text-sm">
                        Followers
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex w-full mt-4 border-b">
                <div
                  className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("posts")}
                >
                  <span className="font-medium">Posts</span>
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
                {isMyProfile && (
                  <div
                    className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                    onClick={() => setFeedType("likes")}
                  >
                    <span className="font-medium">Likes</span>
                    {feedType === "likes" && (
                      <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <Posts feedType={feedType} userId={id} />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
