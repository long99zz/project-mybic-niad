import React from "react";
import PostManager from "@/components/admin/PostManager";

const Posts: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">Quản lý Bài viết</h1>
      <PostManager />
    </div>
  );
};

export default Posts;
