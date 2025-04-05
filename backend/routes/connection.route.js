import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingConnectionRequests,
  getConnections,
  removeConnection,
  getConnectionStatus,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest);
router.put("/reject/:requestId", protectRoute, rejectConnectionRequest);

router.get("/", protectRoute, getConnections);
router.get("/requests", protectRoute, getPendingConnectionRequests);
router.delete("/remove/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);

export default router;
