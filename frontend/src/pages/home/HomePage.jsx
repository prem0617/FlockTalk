import { useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="flex-[4_4_0] mr-auto min-h-screen max-w-3xl pt-3">
      {/* CREATE POST INPUT */}
      <div className="mb-6 px-4 md:px-0">
        <CreatePost />
      </div>

      {/* FEED TOGGLE */}
      <div className="card bg-base-100 shadow-md mb-6 mx-4 md:mx-0 overflow-hidden border border-base-200 hover:shadow-lg transition-all duration-300">
        <div className="card-body p-0">
          <div className="flex">
            <button
              className={`flex-1 py-4 font-medium text-sm relative transition-all duration-300 ${
                feedType === "forYou"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content"
              }`}
              onClick={() => setFeedType("forYou")}
            >
              For you
              {feedType === "forYou" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-primary shadow-md"></div>
              )}
            </button>

            <button
              className={`flex-1 py-4 font-medium text-sm relative transition-all duration-300 ${
                feedType === "following"
                  ? "text-primary"
                  : "text-base-content/70 hover:text-base-content"
              }`}
              onClick={() => setFeedType("following")}
            >
              Following
              {feedType === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-primary shadow-md"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="px-4 md:px-0 space-y-6">
        <Posts feedType={feedType} />
      </div>
    </div>
  );
};

export default HomePage;
