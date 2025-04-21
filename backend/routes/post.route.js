import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";

import {
  bookMark,
  commentOnPost,
  createPost,
  deletePost,
  getAllPost,
  getBookMarkPosts,
  getFollowingPost,
  getLikedPost,
  getUserPost,
  likeUnlikePost,
} from "../controllers/post.controller.js";

import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/getAllPost", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingPost);
router.get("/userPost/:userId", protectRoute, getUserPost);
router.post("/create", protectRoute, upload.single("image"), createPost);
router.get("/getLikedPost/:id", protectRoute, getLikedPost);
router.post("/delete/:id", protectRoute, deletePost);
router.get("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.get("/bookmark/:id", protectRoute, bookMark);
router.get("/getBookmark", protectRoute, getBookMarkPosts);

export default router;
