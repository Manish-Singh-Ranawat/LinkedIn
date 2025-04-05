import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getConnectionSuggestions,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectRoute, getConnectionSuggestions);
router.get("/:username", protectRoute, getUserProfile);
router.put("/update_profile", protectRoute, updateUserProfile);

export default router;
