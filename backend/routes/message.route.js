import express from "express";
import {
  getAllMessage,
  getUserChats,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/getMessages/:id", protectRoute, getAllMessage);
router.post("/sendMessage/:id", protectRoute, sendMessage);
router.get("/chatUsrs", protectRoute, getUserChats);

export default router;
