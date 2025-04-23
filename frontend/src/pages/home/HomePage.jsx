import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="flex-[4_4_0] w-full min-h-screen max-w-3xl pt-1 sm:pt-2 md:pt-3 mx-auto">
      {/* CREATE POST INPUT */}
      <div className="mb-3 sm:mb-4 md:mb-6 px-1 sm:px-2 md:px-4 lg:px-0">
        <CreatePost />
      </div>

      {/* FEED TOGGLE */}
      <div className="card bg-base-100 shadow-md mb-3 sm:mb-4 md:mb-6 mx-1 sm:mx-4 md:mx-9 lg:mx-5 overflow-hidden border border-base-200 hover:shadow-lg transition-all duration-300">
        <div className="card-body p-0">
          <div className="flex">
            <button
              className={`flex-1 py-2 sm:py-3 md:py-4 font-medium text-xs sm:text-sm relative transition-all duration-300 ${
                feedType === "forYou"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content"
              }`}
              onClick={() => setFeedType("forYou")}
              aria-pressed={feedType === "forYou"}
            >
              For you
              {feedType === "forYou" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 rounded-full bg-primary shadow-md"></div>
              )}
            </button>

            <button
              className={`flex-1 py-2 sm:py-3 md:py-4 font-medium text-xs sm:text-sm relative transition-all duration-300 ${
                feedType === "following"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content"
              }`}
              onClick={() => setFeedType("following")}
              aria-pressed={feedType === "following"}
            >
              Following
              {feedType === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 rounded-full bg-primary shadow-md"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="px-1 sm:px-2 md:px-4 lg:px-0 space-y-3 sm:space-y-4 md:space-y-6">
        <Posts feedType={feedType} />
      </div>
    </div>
  );
};

export default HomePage;
