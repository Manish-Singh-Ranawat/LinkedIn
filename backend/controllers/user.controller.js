import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { deleteImageFromCloudinary } from "../utils/deleteImageFromCloudinary.js";

// -- GET CONNECTION SUGGESTIONS --
export const getConnectionSuggestions = async (req, res) => {
  try {
    // suggest users that are not already in the current user's connections
    const currentUser = await User.findById(req.user._id).select("connections");
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(5);
    res.status(200).json({ suggestedUsers });

    // handle errors
  } catch (error) {
    console.log("error in get connection suggestions controller : ", error);
    res.status(500).json({
      message: "Failed to get connection suggestions",
    });
  }
};

// -- GET USER PROFILE --
export const getUserProfile = async (req, res) => {
  try {
    // find user
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);

    // handle errors
  } catch (error) {
    console.log("error in get public profile controller : ", error);
    res.status(500).json({
      message: "Failed to get public profile",
    });
  }
};

// -- UPDATE USER PROFILE --
export const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updatedData = {};
    for (const fields of allowedFields) {
      if (req.body[fields]) {
        updatedData[fields] = req.body[fields];
      }
    }

    // upload profile picture and banner image
    if (req.body.profilePicture) {
      deleteImageFromCloudinary(req.user.profilePicture);
      const uploadedImage = await cloudinary.uploader.upload(
        req.body.profilePicture,
        {
          folder: "linkedin",
        }
      );
      updatedData.profilePicture = uploadedImage.secure_url;
    }
    if (req.body.bannerImg) {
      deleteImageFromCloudinary(req.user.bannerImg);
      const uploadedImage = await cloudinary.uploader.upload(
        req.body.bannerImg,
        {
          folder: "linkedin",
        }
      );
      updatedData.bannerImg = uploadedImage.secure_url;
    }

    // update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true }
    ).select("-password");
    res.status(200).json({ message: "Profile updated successfully", user });

    // handle errors
  } catch (error) {
    console.log("error in update user profile controller : ", error);
    res.status(500).json({
      message: "Failed to update user profile",
    });
  }
};
