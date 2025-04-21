import express from "express";
import { followUnfollow } from "../controllers/learn.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/followUnfollow/:id", protectRoute, followUnfollow);

export default router;
