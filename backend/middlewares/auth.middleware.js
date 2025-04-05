import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV_VARS } from "../lib/envVars.js";

export const protectRoute = async (req, res, next) => {
  try {
    // check if token exists
    const token = req.cookies["jwt-linkedin"];
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // verify token
    const { userId } = jwt.verify(token, ENV_VARS.JWT_SECRET);
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    // set user in request
    req.user = user; 
    next();

    // handle errors
  } catch (error) {
    console.log("error in protect route middleware : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
