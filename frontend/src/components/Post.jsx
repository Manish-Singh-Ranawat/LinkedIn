import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Loader,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import PostAction from "./PostAction";

const Post = ({ post }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const isOwner = post.author._id == authUser._id;
  const isLiked = post.likes.includes(authUser._id);

  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/posts/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      toast.success("Post deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to delete post");
    },
  });

  const { mutate: createComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (newComment) => {
      await axiosInstance.post(`/posts/${post._id}/comment`, {
        content: newComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      toast.success("Comment created successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to create comment");
    },
  });

  const { mutate: likePost, isPending: isLikingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/posts/${post._id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
      toast.success(isLiked ? "Post unliked" : "Post liked");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to like post");
    },
  });

  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost();
  };

  const handleLikePost = () => {
    if (isLikingPost) return;
    likePost();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      createComment(newComment);
      setNewComment("");
      setComments([
        ...comments,
        {
          user: authUser,
          content: newComment,
          createdAt: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="bg-secondary rounded-lg shadow mb-4" key={post._id}>
      <div className="p-4">
        {/* Post header */}
        <div className="flex items-center justify-between mb-4">
          {/* Post author */}
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post.author.profilePicture || "/avatar.png"}
                alt={post.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>
            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">{post.author.name}</h3>
              </Link>
              <p className="text-xs text-info">{post.author.headline}</p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {/* Delete button */}
          {isOwner && (
            <button
              onClick={handleDeletePost}
              className="text-red-500 hover:text-red-700"
            >
              {isDeletingPost ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>
        {/* Post content */}
        <div>
          <Link to={`/post/${post._id}`}>
            <p className="mb-4">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post Image"
                className="rounded-lg w-full mb-4"
              />
            )}
          </Link>
          {/* Actions */}
          <div className="flex justify-between text-info">
            {/* Like */}
            <PostAction
              icon={
                <ThumbsUp
                  size={18}
                  className={isLiked ? "text-blue-500  fill-blue-300" : ""}
                />
              }
              text={`Like (${post.likes.length})`}
              onClick={handleLikePost}
            />
            {/* Comment */}
            <PostAction
              icon={<MessageCircle size={18} />}
              text={`Comment (${comments.length})`}
              onClick={() => setShowComments(!showComments)}
            />
            {/* Share */}
            <PostAction icon={<Share2 size={18} />} text="Share" />
          </div>
        </div>
      </div>
      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 mt-2">
          <div className="mb-2 max-h-60 overflow-y-auto">
            {comments.map((comment, idx) => (
              <div
                key={idx}
                className="mb-2 bg-base-100 p-2 rounded-lg flex items-start"
              >
                <img
                  src={comment.user.profilePicture || "/avatar.png"}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold mr-2">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-info">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 pl-4 rounded-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary "
            />
            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition duration-300"
              disabled={isAddingComment}
            >
              {isAddingComment ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
