const PostSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full p-3 sm:p-4">
      <div className="flex gap-2 sm:gap-4 items-center">
        <div className="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-1 sm:gap-2">
          <div className="skeleton h-2 w-10 sm:w-12 rounded-full"></div>
          <div className="skeleton h-2 w-16 sm:w-24 rounded-full"></div>
        </div>
      </div>
      <div className="skeleton h-32 sm:h-36 md:h-40 w-full"></div>
    </div>
  );
};
export default PostSkeleton;
