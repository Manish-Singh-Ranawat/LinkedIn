import jwt from "jsonwebtoken";
import { ENV_VARS } from "../lib/envVars.js";

export const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, ENV_VARS.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt-linkedin", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true,
    sameSite: "strict",
    secure: ENV_VARS.NODE_ENV === "production",
  });
  return token;
};
