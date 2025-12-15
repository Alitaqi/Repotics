// components/layout/PostCard.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  MoreHorizontal, CheckCircle2, MessageCircle, Share, Flag,
  ChevronUp, ChevronDown, Edit, Trash2, Loader2,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import EditPostDialog from "./EditPostDialog";
import DeletePostDialog from "./DeletePostDialog";
import PostComment from "./PostComment";
import { 
  useUpvotePostMutation, 
  useDownvotePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddCommentMutation
} from "@/lib/redux/api/reportApi";
import { 
  useCheckFollowStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation 
} from "@/lib/redux/api/profileApi";
import { useNavigate } from "react-router-dom";
import PostModal from "./PostModal";

export default function PostCard({ post, refetchPosts }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && post.user?._id === currentUser._id;

  // Single source of truth for post data
  const [postData, setPostData] = useState(post);

  // Sync postData when post prop changes (e.g., after refetch)
  useEffect(() => {
    setPostData(post);
  }, [post]);

  // Modal states
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Follow logic
  const { data: followStatusData } = useCheckFollowStatusQuery(
    post.user?.username,
    { skip: !currentUser || isOwner || !post.user?.username }
  );
  const isFollowingUser = followStatusData?.isFollowing ?? false;

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const handleFollow = async () => {
    if (!post.user?.username) return;
    try {
      await followUser(post.user.username).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (err) { console.error("Follow failed:", err); }
  };
  
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    if (post.user?.username) navigate(`/profile/${post.user.username}`);
  };
  
  const handleUnfollow = async () => {
    if (!post.user?.username) return;
    try {
      await unfollowUser(post.user.username).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (err) { console.error("Unfollow failed:", err); }
  };

  // Image handlers
  const handleImageClick = () => {
    setSelectedPostId(postData._id);
    setSelectedPost(postData);
  };

  const handleSliderImageClick = (index = 0) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleClosePost = () => {
    setSelectedPostId(null);
    setSelectedPost(null);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  // Voting with separate counters
  const [upvotePost, { isLoading: isUpvoting }] = useUpvotePostMutation();
  const [downvotePost, { isLoading: isDownvoting }] = useDownvotePostMutation();

  const handleVote = async (type) => {
    if (!currentUser) return;

    try {
      let response;
      if (type === 'upvote') {
        response = await upvotePost(postData._id).unwrap();
      } else {
        response = await downvotePost(postData._id).unwrap();
      }
      
      // Update with server response - separate counters
      setPostData(prevData => ({
        ...prevData,
        userVote: response.userVote,
        upvotes: response.upvotes !== undefined ? response.upvotes : prevData.upvotes,
        downvotes: response.downvotes !== undefined ? response.downvotes : prevData.downvotes
      }));
      
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  // Edit/Delete
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = async (postId, newDescription) => {
    try {
      const response = await updatePost({ postId, description: newDescription }).unwrap();
      setEditDialogOpen(false);
      
      setPostData(prevData => ({
        ...prevData,
        description: newDescription
      }));
      
      if (refetchPosts) refetchPosts();
    } catch (err) { console.error("Edit failed:", err); }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId).unwrap();
      setDeleteDialogOpen(false);
      if (refetchPosts) refetchPosts();
    } catch (err) { console.error("Delete failed:", err); }
  };

  // Comments
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [addComment] = useAddCommentMutation();

  // Sync comments when post changes
  useEffect(() => {
    setComments(post.comments || []);
  }, [post.comments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    const localComment = {
      _id: `temp-${Date.now()}`,
      text: newComment,
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        profilePicture: currentUser.profilePicture,
        verified: currentUser.verified,
      },
      upvotes: [],
      downvotes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      userVote: null,
    };

    setComments((prev) => [...prev, localComment]);
    setNewComment("");

    try {
      const response = await addComment({ postId: postData._id, text: localComment.text }).unwrap();
      // Replace temp comment with real one
      setComments((prev) => 
        prev.map(c => c._id === localComment._id ? response.comment : c)
      );
    } catch (err) {
      console.error("Add comment failed:", err);
      setComments((prev) => prev.filter((c) => c._id !== localComment._id));
    }
  };

  // Get separate upvote and downvote counts
  const upvoteCount = typeof postData.upvotes === 'number' 
    ? postData.upvotes 
    : (postData.upvotes?.length || 0);
  const downvoteCount = typeof postData.downvotes === 'number' 
    ? postData.downvotes 
    : (postData.downvotes?.length || 0);

  if (!post) return null;

  return (
    <>
      <Card className="shadow-sm rounded-xl">
        <CardContent className="p-4">
          {/* Top Section */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 transition cursor-pointer hover:opacity-80"
              onClick={handleProfileClick}
            >
              <Avatar>
                <AvatarImage src={postData.user?.profilePicture || "/default-avatar.png"} />
                <AvatarFallback>{postData.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{postData.user?.name}</h3>
                  {postData.user?.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  {postData.crimeType && <Badge variant="secondary">{postData.crimeType}</Badge>}
                </div>
                <p className="text-sm text-gray-500">
                  @{postData.user?.username} • {new Date(postData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Right */}
            <div className="flex items-center gap-2">
              {!isOwner && currentUser && postData.user?.username && !postData.anonymous && (
                <Button
                  variant={isFollowingUser ? "outline" : "default"}
                  size="sm"
                  onClick={isFollowingUser ? handleUnfollow : handleFollow}
                  disabled={isFollowing || isUnfollowing}
                  className="flex items-center gap-1"
                >
                  {isFollowing || isUnfollowing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowingUser ? "Followed" : "Follow"}
                </Button>
              )}

              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : currentUser ? (
                <Button size="icon" variant="ghost">
                  <Flag className="w-5 h-5" />
                </Button>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm whitespace-pre-line">{postData.description}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {postData.hashtags?.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* Images - Updated with Swiper slider */}
          {postData.images?.length > 0 && (
            <div className="mt-3">
              <Swiper
                modules={[Navigation, Pagination, Zoom, Keyboard]}
                spaceBetween={10}
                slidesPerView={1}
                navigation={postData.images.length > 1}
                pagination={{ clickable: true, dynamicBullets: true }}
                autoHeight={true}
                keyboard={{ enabled: true }}
                zoom={true}
                className="rounded-lg post-image-swiper"
              >
                {postData.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div 
                      className="relative flex items-center justify-center w-full bg-gray-100 rounded-lg cursor-pointer"
                      onClick={handleImageClick} 
                    >
                      <img
                        src={img}
                        alt={`Post image ${index + 1}`}
                        className="max-h-[80vh] w-auto h-auto object-contain transition-transform duration-300 rounded-lg hover:scale-105"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {postData.images.length > 1 && (
                <div className="mt-2 text-xs text-center text-gray-500">
                  Slide to view more images
                </div>
              )}
            </div>
          )}

          {/* Separate vote counters display */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ChevronUp className="w-4 h-4 text-green-600" />
                {upvoteCount} upvotes
              </span>
              <span className="flex items-center gap-1">
                <ChevronDown className="w-4 h-4 text-red-600" />
                {downvoteCount} downvotes
              </span>
            </div>
            <span>{comments.length} comments</span>
          </div>

          <hr className="my-3" />

          {/* Action Buttons */}
          <div className="flex justify-around">
            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${postData.userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
            >
              {isUpvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronUp className="w-4 h-4" />}
              Upvote
            </Button>

            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${postData.userVote === "downvote" ? "text-red-600" : ""}`}
              onClick={() => handleVote("downvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
            >
              {isDownvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              Downvote
            </Button>

            <Button
              variant="ghost"
              className="flex items-center gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" /> Comment
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="pt-4 mt-4 border-t">
              {/* Add comment input */}
              <div className="flex gap-3 mb-6">
                <Avatar className="flex-shrink-0 w-8 h-8">
                  <AvatarImage src={currentUser?.profilePicture || "/default-avatar.png"} />
                  <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setNewComment("")}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || !currentUser}>
                      Post Comment
                    </Button>
                  </div>
                  {!currentUser && <p className="mt-1 text-xs text-gray-500">Please log in to comment</p>}
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <PostComment
                      key={comment._id}
                      comment={comment}
                      postId={postData._id}
                      postOwnerId={postData.user?._id}
                      refetchPosts={refetchPosts}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-gray-500">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Delete Dialogs */}
      <EditPostDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        post={postData}
        onSave={handleEdit}
        isLoading={isUpdating}
      />

      <DeletePostDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        post={postData}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />

      {/* Add PostModal */}
      <PostModal
        selectedPostId={selectedPostId}
        handleClosePost={handleClosePost}
        post={selectedPost || postData}
        refetchPosts={refetchPosts}
      />

      {/* Fullscreen Image Viewer */}
      {isImageViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full h-full max-w-6xl max-h-screen">
            {/* Close button */}
            <button
              onClick={handleCloseImageViewer}
              className="absolute z-10 p-2 text-white transition-all bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-70"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Swiper for fullscreen images */}
            <Swiper
              modules={[Navigation, Pagination, Zoom, Keyboard]}
              spaceBetween={50}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{ 
                clickable: true,
                type: 'fraction'
              }}
              zoom={true}
              keyboard={{ enabled: true }}
              initialSlide={currentImageIndex}
              className="w-full "
            >
              {postData.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <div className="h-auto swiper-zoom-container">
                    <img
                      src={img}
                      alt={`Post image ${index + 1}`}
                      className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom navigation buttons */}
            <button className="absolute z-10 p-1 text-white transition-all transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full swiper-button-prev-custom left-2 top-1/2 hover:bg-opacity-70">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="absolute z-10 p-1 text-white transition-all transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full swiper-button-next-custom right-2 top-1/2 hover:bg-opacity-70">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        .post-image-swiper .swiper-button-prev,
        .post-image-swiper .swiper-button-next {
          width: 30px;
          height: 30px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          padding: 5px;
          color: white;
        }
        .post-image-swiper .swiper-button-prev:after,
        .post-image-swiper .swiper-button-next:after {
          font-size: 12px;
          font-weight: bold;
        }
        .post-image-swiper .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
        }
        .post-image-swiper .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
    </>
  );
}