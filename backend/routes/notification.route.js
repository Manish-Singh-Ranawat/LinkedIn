import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.put("/read/:id", protectRoute, markNotificationAsRead);
router.delete("/delete/:id", protectRoute, deleteNotification);

export default router;