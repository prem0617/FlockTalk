import { generateTokenAndSetCookies } from "../lib/utils/generateTokenAndSetCookies.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ?remaing TODO
// TODO : Edit user's username to lowercase and execeute the query while login or sign up with lower case username same for email so we can get the correct even is user fill the details in different case

// signup route
export const signup = async (req, res) => {
  try {
    let { username, password, fullname, email } = await req.body;

    console.log({ username, password, fullname, email });

    if (!username || !password || !fullname || !email) {
      res.status(403).json({ error: "Please fill all fields" });
    }

    // check for valid email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(403).json({
        error: "Invalid email address",
      });
    }

    username = username.toLowerCase();

    // check is unique username
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    //check for unique email
    const existingEmail = await UserModel.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    //check length of password
    if (password.length < 6) {
      return res.status(400).json({ error: "Password too short" });
    }

    // hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      email,
      username,
      fullname,
    });

    // check is user created or not
    if (newUser) {
      // is user created then seeting cookie
      generateTokenAndSetCookies(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullname: newUser.fullname,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        message: "User signin succeccfully",
      });
    } else {
      res.status(400).json({ error: "Invlaid user data" });

      console.log(`Error in creating new user`);
    }
  } catch (error) {
    // error
    res.status(500).json({ error: error.message });
    console.error(`Error in signup control : ${error.message}`);
  }
};

// login route
export const login = async (req, res) => {
  try {
    let { username, password } = await req.body;

    console.log({ username, password });

    if (!username || !password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    username = username.toLowerCase();
    // get the data of user from DB
    const user = await UserModel.findOne({ username });
    // check is user if exists or not
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user?.password || "");

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // set cookies
    generateTokenAndSetCookies(user._id, res);

    res.status(200).json({ message: "User login successfully", user });
  } catch (error) {
    // error
    res.status(500).json({ error: error.message });
    console.error(`Error in signup control : ${error.message}`);
  }
};

// logout route
export const logout = async (req, res) => {
  try {
    // remove cookies from browser session`
    res.cookie("flocktalk", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    // error
    res.status(500).json({ error: error.message });
    console.error(`Error in signup control : ${error.message}`);
  }
};

// get user profile route
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe", error.message);
    res.status(500).json({ error: "Error in getMe, Internal server error" });
  }
};
