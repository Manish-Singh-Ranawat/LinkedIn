import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import { Loader } from "lucide-react";

const PostPage = () => {
  const { postId } = useParams();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/posts/${postId}`);
      return res.data;
    },
  });

  if (isLoading)
    return (
      <div className=" flex justify-center items-center">
        <Loader className="size-5 animate-spin" />
      </div>
    );
    
  if (!post) return <div>Post not found</div>;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <Post post={post} />
      </div>
    </div>
  );
};
export default PostPage;
