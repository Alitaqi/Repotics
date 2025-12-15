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
  
  // Single source of truth for post data
  const [postData, setPostData] = useState(post);
  
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [upvotePost, { isLoading: isUpvoting }] = useUpvotePostMutation();
  const [downvotePost, { isLoading: isDownvoting }] = useDownvotePostMutation();
  const navigate = useNavigate();

  // Sync postData when post prop changes
  useEffect(() => {
    setPostData(post);
  }, [post]);

  // Initialize comments when post changes
  useEffect(() => {
    if (post?.comments) {
      console.log("PostModal comments before processing:", post.comments);
      const processedComments = processCommentsWithUserData(post.comments, post.user);
      console.log("PostModal comments after processing:", processedComments);
      setComments(processedComments);
    }
  }, [post]);

  //if (!post) return null;
  if (!post || !postData) return null;

  //  Get separate upvote and downvote counts
  const upvoteCount = typeof postData.upvotes === 'number' 
    ? postData.upvotes 
    : (postData.upvotes?.length || 0);
  const downvoteCount = typeof postData.downvotes === 'number' 
    ? postData.downvotes 
    : (postData.downvotes?.length || 0);

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
      await addComment({ postId: postData._id, text: newComment }).unwrap();
      // Refetch to get the actual comment with proper ID
      if (refetchPosts) refetchPosts();
    } catch (err) {
      console.error("Add comment failed:", err);
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => comment._id !== tempComment._id));
    }
  };

  //Voting with separate counters
  const handleVote = async (type) => {
    if (!currentUser) return;

    try {
      let response;
      if (type === 'upvote') {
        response = await upvotePost(postData._id).unwrap();
      } else {
        response = await downvotePost(postData._id).unwrap();
      }
      
      //Update with server response - separate counters
      setPostData(prevData => ({
        ...prevData,
        userVote: response.userVote,
        upvotes: response.upvotes !== undefined ? response.upvotes : prevData.upvotes,
        downvotes: response.downvotes !== undefined ? response.downvotes : prevData.downvotes
      }));
      
      if (refetchPosts) refetchPosts();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleProfileClick = () => {
    if (postData.user?.username) navigate(`/profile/${postData.user.username}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === postData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? postData.images.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={!!selectedPostId} onOpenChange={handleClosePost}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-5xl md:max-h-[90vh] h-[90vh] flex flex-col md:flex-row rounded-2xl border-none">
        {/* LEFT: Image Slider */}
        <div className="relative flex items-center justify-center w-full bg-black md:w-1/2">
          {postData.images?.length > 0 ? (
            <>
              <img
                src={postData.images[currentImageIndex]}
                alt="post"
                className="object-contain w-full h-full"
              />
              {postData.images.length > 1 && (
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
                  src={postData.user?.profilePicture || "/default-avatar.png"}
                />
                <AvatarFallback>{postData.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{postData.user?.name}</h3>
                  {postData.user?.verified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  )}
                  {postData.crimeType && (
                    <Badge variant="secondary">{postData.crimeType}</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  @{postData.user?.username} •{" "}
                  {new Date(postData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {/* Description */}
          <div className="py-3 text-sm whitespace-pre-line">
            {postData.description}
          </div>
          {/* Hashtags */}
          {postData.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {postData.hashtags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Separate vote counters display */}
          <div className="flex items-center justify-between py-2 text-sm text-gray-500 border-y">
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

          {/* Vote Buttons with colors */}
          <div className="flex justify-around py-2 border-b">
            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${postData.userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
            >
              {isUpvoting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
              Upvote
            </Button>

            <Button
              variant="ghost"
              className={`flex items-center gap-1 ${postData.userVote === "downvote" ? "text-red-600" : ""}`}
              onClick={() => handleVote("downvote")}
              disabled={isUpvoting || isDownvoting || !currentUser}
            >
              {isDownvoting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Downvote
            </Button>
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
                      postId={postData._id}
                      postOwnerId={postData.user?._id}
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