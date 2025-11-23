import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import PostComment from "./PostComment";
import {
  useAddCommentMutation,
  useUpvotePostMutation,
  useDownvotePostMutation,
} from "@/lib/redux/api/reportApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Helper function to process comments and replies with proper user data
const processCommentsWithUserData = (comments, postUser) => {
  if (!comments || !Array.isArray(comments)) return [];
  
  return comments.map(comment => {
    // If comment.user is a string (user ID), convert it to user object structure
    let processedComment = { ...comment };
    
    if (typeof comment.user === 'string') {
      processedComment.user = {
        _id: comment.user,
        name: "Unknown User",
        profilePicture: "/default-avatar.png",
        verified: false
      };
    }
    
    // Process replies
    if (comment.replies && Array.isArray(comment.replies)) {
      processedComment.replies = comment.replies.map(reply => {
        let processedReply = { ...reply };
        
        if (typeof reply.user === 'string') {
          processedReply.user = {
            _id: reply.user,
            name: "Unknown User", 
            profilePicture: "/default-avatar.png",
            verified: false
          };
        }
        
        return processedReply;
      });
    }
    
    return processedComment;
  });
};

export default function PostModal({ selectedPostId, handleClosePost, post, refetchPosts }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [upvotePost, { isLoading: isUpvoting }] = useUpvotePostMutation();
  const [downvotePost, { isLoading: isDownvoting }] = useDownvotePostMutation();
  const [userVote, setUserVote] = useState(post?.userVote || null);
  const navigate = useNavigate();

  // Initialize comments when post changes
  useEffect(() => {
    if (post?.comments) {
      console.log("PostModal comments before processing:", post.comments);
      const processedComments = processCommentsWithUserData(post.comments, post.user);
      console.log("PostModal comments after processing:", processedComments);
      setComments(processedComments);
    }
  }, [post]);

  if (!post) return null;

  const netVotes = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
  
    // Create optimistic comment with full user object
    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: newComment,
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        profilePicture: currentUser.profilePicture,
        verified: currentUser.verified,
        username: currentUser.username,
      },
      upvotes: [],
      downvotes: [],
      replies: [],
      createdAt: new Date().toISOString(),
      userVote: null,
    };

    // Add optimistic comment
    setComments(prev => [...prev, tempComment]);
    setNewComment("");

    try {
      await addComment({ postId: post._id, text: newComment }).unwrap();
      // Refetch to get the actual comment with proper ID
      if (refetchPosts) refetchPosts();
    } catch (err) {
      console.error("Add comment failed:", err);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => comment._id !== tempComment._id));
    }
  };

  const handleVote = async (type) => {
    if (!currentUser) return;
    const prevVote = userVote;
    setUserVote(prevVote === type ? null : type);
    try {
      if (type === "upvote") await upvotePost(post._id).unwrap();
      else await downvotePost(post._id).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (err) {
      console.error("Vote failed:", err);
      setUserVote(prevVote);
    }
  };

  const handleProfileClick = () => {
    if (post.user?.username) navigate(`/profile/${post.user.username}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={!!selectedPostId} onOpenChange={handleClosePost}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-5xl md:max-h-[90vh] h-[90vh] flex flex-col md:flex-row rounded-2xl border-none">
        {/* LEFT: Image Slider */}
        <div className="relative flex items-center justify-center w-full bg-black md:w-1/2">
          {post.images?.length > 0 ? (
            <>
              <img
                src={post.images[currentImageIndex]}
                alt="post"
                className="object-contain w-full h-full"
              />
              {post.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute p-2 text-white rounded-full left-3 bg-black/40 hover:bg-black/60"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute p-2 text-white rounded-full right-3 bg-black/40 hover:bg-black/60"
                  >
                    ›
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
              No image
            </div>
          )}
        </div>
        {/* RIGHT: Post Details */}
        <div className="flex flex-col justify-between flex-1 p-4 overflow-y-auto bg-white">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80"
              onClick={handleProfileClick}
            >
              <Avatar>
                <AvatarImage
                  src={post.user?.profilePicture || "/default-avatar.png"}
                />
                <AvatarFallback>{post.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{post.user?.name}</h3>
                  {post.user?.verified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  )}
                  {post.crimeType && (
                    <Badge variant="secondary">{post.crimeType}</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  @{post.user?.username} •{" "}
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="py-3 text-sm whitespace-pre-line">
            {post.description}
          </div>
          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.hashtags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {/* Votes */}
          <div className="flex items-center justify-around py-2 border-y">
            <Button
              variant="ghost"
              onClick={() => handleVote("upvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
              className={`flex items-center gap-1 ${
                userVote === "upvote" ? "text-green-600" : ""
              }`}
            >
              {isUpvoting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
              Upvote
            </Button>
            <span className="text-sm text-gray-500">{netVotes} votes</span>
            <Button
              variant="ghost"
              onClick={() => handleVote("downvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
              className={`flex items-center gap-1 ${
                userVote === "downvote" ? "text-red-600" : ""
              }`}
            >
              {isDownvoting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Downvote
            </Button>
          </div>
          {/* Comments Count */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {comments.length} comments
            </span>
          </div>
          {/* Comments */}
          <div className="flex-1 mt-2 overflow-y-auto">
            {showComments && (
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
                  <p className="py-4 text-sm text-center text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Add Comment */}
          <div className="pt-3 mt-4 border-t">
            <div className="flex gap-3">
              <Avatar className="flex-shrink-0 w-8 h-8">
                <AvatarImage
                  src={currentUser?.profilePicture || "/default-avatar.png"}
                />
                <AvatarFallback>{currentUser?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[70px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewComment("")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAdding || !currentUser}
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
                {!currentUser && (
                  <p className="mt-1 text-xs text-gray-500">
                    Please log in to comment
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}