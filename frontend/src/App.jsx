import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { Toaster } from "react-hot-toast";

import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

import BookmarkPage from "./pages/bookmark/BookmarkPage";
import AllUsers from "./pages/messages/AllUsers";
import Message from "./pages/messages/Message";
import useUser from "./context/UserContext";
import ExplorePage from "./pages/explore/ExplorePage";
import FollowingUsers from "./pages/followingUsers/FollowingUsers";
import FollowersUsers from "./pages/followersUsers/FollowersUsers";

function App() {
  const location = useLocation();
  const { loading, user } = useUser();
  // console.log(user, "user");
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="loading loading-spinner loading-lg text-blue-500"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const hideLayoutRoutes = ["/signup", "/login"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-row mx-auto max-w-full sm:max-w-[100%] lg:max-w-[85rem]">
        {!hideLayout && <Sidebar />}
        <div className="flex-1 min-w-0 border-l border-r border-gray-100">
          <Routes>
            <Route
              path="/"
              element={user ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/signup"
              element={!user ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/notification"
              element={user ? <NotificationPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile/:id"
              element={user ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/bookmarks"
              element={user ? <BookmarkPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={user ? <AllUsers /> : <Navigate to="/login" />}
            />
            <Route
              path="/message/:id"
              element={user ? <Message /> : <Navigate to="/login" />}
            />
            <Route
              path="/explore"
              element={user ? <ExplorePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/following/:id"
              element={user ? <FollowingUsers /> : <Navigate to="/login" />}
            />
            <Route
              path="/followers/:id"
              element={user ? <FollowersUsers /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
        {!hideLayout && <RightPanel />}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              maxWidth: "90vw",
              fontSize: "0.875rem",
              padding: "0.5rem 1rem",
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
