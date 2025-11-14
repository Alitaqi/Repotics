// components/layout/PostCard.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  MoreHorizontal, CheckCircle2, MessageCircle, Share, Flag,
  ChevronUp, ChevronDown, Edit, Trash2, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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


export default function PostCard({ post, refetchPosts }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && post.user?._id === currentUser._id;

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

  // Voting
  const [upvotePost, { isLoading: isUpvoting }] = useUpvotePostMutation();
  const [downvotePost, { isLoading: isDownvoting }] = useDownvotePostMutation();
  const [userVote, setUserVote] = useState(post?.userVote || null);

  const handleVote = async (type) => {
    if (!currentUser) return;
    const previousVote = userVote;
    setUserVote(previousVote === type ? null : type);

    try {
      if (type === 'upvote') await upvotePost(post._id).unwrap();
      else await downvotePost(post._id).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (err) {
      console.error('Vote failed:', err);
      setUserVote(previousVote);
    }
  };

  // Edit/Delete
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEdit = async (postId, newDescription) => {
    try {
      await updatePost({ postId, description: newDescription }).unwrap();
      setEditDialogOpen(false);
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
      await addComment({ postId: post._id, text: localComment.text }).unwrap();
      // Optionally replace temp ID with real ID from server
    } catch (err) {
      console.error("Add comment failed:", err);
      setComments((prev) => prev.filter((c) => c._id !== localComment._id));
    }
  };

  const netVotes = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

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
                <AvatarImage src={post.user?.profilePicture || "/default-avatar.png"} />
                <AvatarFallback>{post.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.user?.name}</h3>
                  {post.user?.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                  {post.crimeType && <Badge variant="secondary">{post.crimeType}</Badge>}
                </div>
                <p className="text-sm text-gray-500">
                  @{post.user?.username} • {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Right */}
            <div className="flex items-center gap-2">
              {!isOwner && currentUser && post.user?.username && !post.anonymous && (
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
          <p className="mt-3 text-sm whitespace-pre-line">{post.description}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {post.hashtags?.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* Images */}
          {post.images?.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-3">
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="post image"
                  className="object-cover w-full h-64 rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Votes + Comments count */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <span>{netVotes} votes • {comments.length} comments</span>
          </div>

          <hr className="my-3" />

          {/* Action Buttons */}
          <div className="flex justify-around">
            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
            >
              {isUpvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronUp className="w-4 h-4" />}
              Upvote
            </Button>

            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${userVote === "downvote" ? "text-red-600" : ""}`}
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

            {/* <Button variant="ghost" className="flex items-center gap-1">
              <Share className="w-4 h-4" /> Share
            </Button> */}

            {/* {!isOwner && currentUser && (
              <Button variant="ghost" className="flex items-center gap-1">
                <Flag className="w-4 h-4" /> Report
              </Button>
            )} */}
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
                      postId={post._id}
                      postOwnerId={post.user?._id}
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
        post={post}
        onSave={handleEdit}
        isLoading={isUpdating}
      />

      <DeletePostDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        post={post}
        onDelete={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
