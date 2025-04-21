import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useUser from "../../context/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const user = response.data.user;
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Login successful");
        navigate("/");
      } else {
        throw new Error("Unexpected error occurred");
      }
    } catch (err) {
      const message =
        err?.response?.data?.error || err.message || "Login failed";
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        { username: "guest_0671", password: "guest@321" },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const user = response.data.user;
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Guest login successful");
        navigate("/");
      } else {
        throw new Error("Unexpected error occurred");
      }
    } catch (err) {
      const message =
        err?.response?.data?.error || err.message || "Guest login failed";
      toast.error(message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row justify-center items-center h-screen bg-[#F7F9FC]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-2 bg-white rounded-xl shadow-md"
      >
        <div className="pt-10 px-12 flex flex-col gap-3 md:mt-16">
          <div className="pb-5">
            <p className="font-semibold text-2xl text-center">
              Login to FlockTalk
            </p>
          </div>

          <div>
            <label htmlFor="username" className="text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleInputChange}
              className="input input-bordered w-full max-w-xs rounded-md"
              value={formData.username}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              className="input input-bordered w-full max-w-xs"
              value={formData.password}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 rounded-md py-2 mt-2 text-white"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>

          <button
            type="button"
            onClick={loginAsGuest}
            className="bg-blue-500 rounded-md py-2 text-white"
          >
            Login as Guest
          </button>

          <Link to="/signup">
            <p className="text-xs text-gray-500 text-center pb-10">
              Don't have an Account? Signup
            </p>
          </Link>

          {errorMessage && (
            <p className="text-red-500 text-center text-sm font-bold mb-4">
              {errorMessage}
            </p>
          )}
        </div>

        <div className="overflow-hidden w-[400px] h-[570px] hidden md:block">
          <img
            src="/image/login-image.jpg"
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
