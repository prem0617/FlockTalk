const RightPanelSkeleton = () => {
  return (
    <div className="flex flex-col gap-1 sm:gap-2 w-full md:w-64 lg:w-72 my-1 sm:my-2">
      <div className="flex gap-2 items-center">
        <div className="skeleton w-6 h-6 sm:w-8 sm:h-8 rounded-full shrink-0"></div>
        <div className="flex flex-1 justify-between">
          <div className="flex flex-col gap-1">
            <div className="skeleton h-2 w-10 sm:w-12 rounded-full"></div>
            <div className="skeleton h-2 w-12 sm:w-16 rounded-full"></div>
          </div>
          <div className="skeleton h-5 sm:h-6 w-12 sm:w-14 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
export default RightPanelSkeleton;
