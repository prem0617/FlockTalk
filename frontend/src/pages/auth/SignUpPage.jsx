import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useUser from "../../context/UserContext";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });

  const { setUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/signup",
        formData,
        { withCredentials: true }
      );
      console.log(response.data);

      if (response.status === 200 || response.status === 201) {
        const user = response.data;
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("Login successful");
        navigate("/");
      } else {
        throw new Error("Unexpected error occurred");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Signup failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-row justify-center items-center h-screen bg-[#F7F9FC]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-2 bg-white rounded-xl shadow-md"
      >
        <div className="pt-10 px-12 flex flex-col gap-3">
          <div className="pb-5">
            <p className="font-semibold text-2xl text-center">
              Sign up to FlockTalk
            </p>
            <p className="text-gray-500 text-xs rounded-md text-center">
              A place where you can find a Friend.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              className="input input-bordered w-full max-w-xs rounded-md"
              value={formData.email}
            />
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
            <label htmlFor="fullname" className="text-sm">
              Fullname
            </label>
            <input
              id="fullname"
              type="text"
              placeholder="Fullname"
              name="fullname"
              onChange={handleInputChange}
              className="input input-bordered w-full max-w-xs rounded-md"
              value={formData.fullname}
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

          <button className="bg-green-600 rounded-md py-2 mt-2 text-white">
            {loading ? "Loading..." : "Create Account"}
          </button>

          <Link to="/login">
            <p className="text-xs text-gray-500 text-center">
              Already have an Account? Login
            </p>
          </Link>

          {error && (
            <p className="text-red-500 text-center text-sm font-bold mb-4">
              {error}
            </p>
          )}
        </div>

        <div className="overflow-hidden w-[400px] h-[570px] hidden md:block">
          <img
            src="/image/signup-image.jpg"
            alt="Signup illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;
