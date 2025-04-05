import User from "../models/user.model.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { generateTokenAndSetCookies } from "../utils/jwtToken.js";
import { ENV_VARS } from "../lib/envVars.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

// -- SIGNUP --
export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // check if password is at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // check if user already exists
    const existingUserByEmail = await User.findOne({ email: email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUserByUsername = await User.findOne({ username: username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  create and save user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    // generate jwt-token and assign it to cookie
    generateTokenAndSetCookies(user._id, res);

    res.status(200).json({ message: "User registered successfully" });

    // send welcome email
    const profileUrl = ENV_VARS.CLIENT_URL + "/profile/" + user.username;
    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (emailError) {
      console.log("Error sending welcome email : ", emailError);
    }

    // handle errors
  } catch (error) {
    console.log("error in signup controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// -- LOGIN --
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    // validation
    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Determine if identifier is an email or username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const query = emailRegex.test(identifier)
      ? { email: identifier }
      : { username: identifier };

    // check if user exists by either email or username
    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate jwt-token and assign it to cookie
    generateTokenAndSetCookies(user._id, res);
    res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({
      message: "Failed to log in",
    });
  }
};

// -- LOGOUT --
export const logout = (req, res) => {
  try {
    // clear the JWT cookie
    res.clearCookie("jwt-linkedin");
    res.status(200).json({ message: "Logged out successfully" });

    // handle errors
  } catch (error) {
    console.log("error in logout controller : ", error);
    res.status(500).json({
      message: "Failed to log out",
    });
  }
};

// -- GET CURRENT USER --
export const getCurrentUser = async (req, res) => {
  try {
    // get current user
    res.status(200).json({ user: req.user });

    // handle errors
  } catch (error) {
    console.log("error in get current user controller : ", error);
    res.status(500).json({
      message: "Failed to get current user",
    });
  }
};
