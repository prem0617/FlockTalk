const ProfileHeaderSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 sm:gap-2 w-full my-1 sm:my-2 p-2 sm:p-4">
      <div className="flex gap-1 sm:gap-2 items-center">
        <div className="flex flex-1 gap-1">
          <div className="flex flex-col gap-1 w-full">
            <div className="skeleton h-3 sm:h-4 w-10 sm:w-12 rounded-full"></div>
            <div className="skeleton h-3 sm:h-4 w-12 sm:w-16 rounded-full"></div>
            <div className="skeleton h-28 sm:h-32 md:h-40 w-full relative">
              <div className="skeleton h-16 w-16 sm:h-20 sm:w-20 rounded-full border absolute -bottom-8 sm:-bottom-10 left-2 sm:left-3"></div>
            </div>
            <div className="skeleton h-5 sm:h-6 mt-3 sm:mt-4 w-20 sm:w-24 ml-auto rounded-full"></div>
            <div className="skeleton h-3 sm:h-4 w-12 sm:w-14 rounded-full mt-3 sm:mt-4"></div>
            <div className="skeleton h-3 sm:h-4 w-16 sm:w-20 rounded-full"></div>
            <div className="skeleton h-3 sm:h-4 w-full sm:w-2/3 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeaderSkeleton;
