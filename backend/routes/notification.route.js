import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotification,
  deleteNotifications,
  getNotifications,
  getUnreadedNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.get("/unreaded", protectRoute, getUnreadedNotification);
router.delete("/", protectRoute, deleteNotifications);
router.delete("/:id", protectRoute, deleteNotification);
// router.delete("/:id", protectRoute, deleteNotification);

export default router;
