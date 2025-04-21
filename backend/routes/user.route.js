import express from "express";

import {
  followUnfollowUser,
  getFollowersUsers,
  getFollowingUsers,
  getSuggested,
  getUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.get("/suggested", protectRoute, getSuggested);
router.get("/follow/:id", protectRoute, followUnfollowUser);
router.post(
  "/update",
  protectRoute,
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateUserProfile
);
// router.get("/followingUsers", protectRoute, followingUsers);
router.get("/getFollowingUsers/:id", protectRoute, getFollowingUsers);
router.get("/getFollowersUsers/:id", protectRoute, getFollowersUsers);
router.get("/:id", protectRoute, getUser);

export default router;
