import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.cookies.flocktalk;

    if (!token) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this route" });
    }

    // decode token
    const payload = await jwt.verify(token, process.env.JWT_SECRET);

    // check if payload is available or not
    if (!payload) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this route" });
    }

    // find user from DB
    const user = await UserModel.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
