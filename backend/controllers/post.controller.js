import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import { deleteImageFromCloudinary } from "../utils/deleteImageFromCloudinary.js";
import mongoose from "mongoose";

//  -- GET FEED POSTS --
export const getFeedPosts = async (req, res) => {
  try {
    const postsFromConnectionsAndSelf = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture ")
      .sort({
        createdAt: -1,
      });
    // res.status(200).json(posts);
    const trendingPosts = await Post.find()
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture ")
      .sort({ likes: -1 })
      .limit(10);

    const suggestedPosts = await Post.find({
      author: { $nin: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture ")
      .sort({ createdAt: -1 })
      .limit(10);

    const uniquePosts = new Map();
    [
      ...postsFromConnectionsAndSelf,
      ...trendingPosts,
      ...suggestedPosts,
    ].forEach((post) => {
      uniquePosts.set(post._id.toString(), post);
    });

    const posts = Array.from(uniquePosts.values());
    res.status(200).json(posts);
  } catch (error) {
    console.log("error in get feed posts controller : ", error);
    res.status(500).json({
      message: "Failed to get feed posts",
    });
  }
};

// -- CREATE POST --
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content.trim())
      return res.status(400).json({ message: "Content is required" });
    let newPost = new Post({
      author: req.user._id,
      content,
    });
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: "linkedin",
      });
      newPost.image = uploadedImage.secure_url;
    }
    await newPost.save();
    res.status(201).json({
      message: "Post created successfully",
      newPost,
    });
  } catch (error) {
    console.log("error in create post controller : ", error);
    res.status(500).json({
      message: "Failed to create post",
    });
  }
};

// -- DELETE POST --
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    // check if the post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // check if the user is authorized to delete the post
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
      });
    }
    // delete the image from cloudinary
    if (post.image) {
      await deleteImageFromCloudinary(post.image);
    }
    // delete the post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log("error in delete post controller : ", error);
    res.status(500).json({
      message: "Failed to delete post",
    });
  }
};

// -- GET POST BY ID --
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username profilePicture");
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    res.status(200).json(post);
  } catch (error) {
    console.log("error in get post by id controller : ", error);
    res.status(500).json({
      message: "Failed to get post",
    });
  }
};

// -- CREATE COMMENT --
export const createComment = async (req, res) => {
  try {
    // create comment
    const postId = req.params.id;
    const { content } = req.body;
    if (!content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { user: req.user._id, content } },
      },
      { new: true }
    ).populate("author", "name username email profilePicture headline");

    // create comment notification
    if (post.author._id.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });
      await notification.save();

      // send email notification
      try {
        const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.log("error in send comment notification email : ", error);
      }
    }
    res.status(201).json(post);
  } catch (error) {
    console.log("error in create comment controller : ", error);
    res.status(500).json({
      message: "Failed to create comment",
    });
  }
};

// -- LIKE POST --
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const userId = req.user._id;
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    if (post.likes.includes(userId)) {
      // unlike the post
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
    } else {
      // like
      post.likes.push(userId);
      if (post.author.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        await notification.save();
      }
    }
    await post.save();
    res.status(200).json({
      message: "Post liked successfully",
    });

    // handle errors
  } catch (error) {
    console.log("error in like post controller : ", error);
    res.status(500).json({
      message: "Failed to like post",
    });
  }
};
