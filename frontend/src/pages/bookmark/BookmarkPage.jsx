import React from "react";
import Posts from "../../components/common/Posts";

const BookmarkPage = () => {
  return (
    <div className="mx-5">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold text-center py-4 border-b mb-2 md:hidden">
        Bookmark
      </h1>
      {/* Desktop Heading */}
      <h1 className="text-2xl font-bold hidden md:block py-4 border-b mb-2">
        Bookmark
      </h1>

      <Posts feedType={"bookmarks"} />
    </div>
  );
};

export default BookmarkPage;
