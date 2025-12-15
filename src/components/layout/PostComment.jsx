// components/layout/PostComment.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Reply, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useVoteCommentMutation, 
  useAddReplyMutation, 
  useDeleteCommentMutation, 
  useVoteReplyMutation,
  useDeleteReplyMutation
} from "@/lib/redux/api/reportApi";

// Helper function to safely get user data
const getUserData = (user) => {
  if (!user) return { name: "Unknown User", profilePicture: null, verified: false };
  
  return {
    name: user.name || user.username || "Unknown User",
    profilePicture: user.profilePicture,
    verified: user.verified || false,
    id: user._id || user.id || user.$oid
  };
};

// Helper function to check if user is owner
const isUserOwner = (user, currentUser) => {
  if (!user || !currentUser) return false;
  
  const userId = user._id || user.id || user.$oid;
  const currentUserId = currentUser._id || currentUser.id;
  
  return userId === currentUserId;
};

// Reply component - UPDATED WITH SEPARATE COUNTERS
function ReplyComment({ reply: initialReply, postId, commentId, refetchPosts }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [voteReply, { isLoading: isVoting }] = useVoteReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  
  // Local state synced from prop
  const [replyData, setReplyData] = useState(initialReply);

  // Sync when parent updates
  useEffect(() => {
    setReplyData(initialReply);
  }, [initialReply]);
  
  const replyUser = getUserData(replyData.user);
  const isReplyOwner = isUserOwner(replyData.user, currentUser);
  
  // Get separate upvote and downvote counts
  const upvoteCount = typeof replyData.upvotes === 'number' 
    ? replyData.upvotes 
    : (replyData.upvotes?.length || 0);
  const downvoteCount = typeof replyData.downvotes === 'number' 
    ? replyData.downvotes 
    : (replyData.downvotes?.length || 0);

  // Direct backend sync
  const handleVote = async (type) => {
    if (!currentUser || isVoting) return;
    
    try {
      // Call backend and wait for response
      const response = await voteReply({ postId, commentId, replyId: replyData._id, type }).unwrap();
      
      // Update with EXACT backend data
      if (response.reply) {
        setReplyData(prevData => ({
          ...prevData,
          userVote: response.reply.userVote,
          upvotes: response.reply.upvotes !== undefined ? response.reply.upvotes : prevData.upvotes,
          downvotes: response.reply.downvotes !== undefined ? response.reply.downvotes : prevData.downvotes
        }));
      } else if (response.comment) {
        // Some backends return the parent comment with updated reply
        const updatedReply = response.comment.replies?.find(r => r._id === replyData._id);
        if (updatedReply) {
          setReplyData(prevData => ({
            ...prevData,
            userVote: updatedReply.userVote,
            upvotes: updatedReply.upvotes !== undefined ? updatedReply.upvotes : prevData.upvotes,
            downvotes: updatedReply.downvotes !== undefined ? updatedReply.downvotes : prevData.downvotes
          }));
        }
      }
      
      // Optional: refetch to sync everything
      if (refetchPosts) {
        setTimeout(() => refetchPosts(), 100);
      }
    } catch (error) {
      console.error('Vote reply failed:', error);
    }
  };

  const handleDeleteReply = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await deleteReply({ postId, commentId, replyId: replyData._id }).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (error) {
      console.error('Delete reply failed:', error);
      alert('Failed to delete reply: ' + (error.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="flex gap-2">
      <Avatar className="flex-shrink-0 w-6 h-6">
        <AvatarImage src={replyUser.profilePicture} />
        <AvatarFallback className="text-xs">{replyUser.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">{replyUser.name}</span>
          {replyUser.verified && <Badge variant="secondary" className="h-3 text-xs">✓</Badge>}
          <span className="text-xs text-gray-500">
            {new Date(replyData.createdAt).toLocaleDateString()}
          </span>
          
          {isReplyOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-4 h-4">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeleteReply} className="text-red-600">
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete Reply
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="mb-1 text-xs">{replyData.text}</p>
        
        {/* Separate vote counters display */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <Button
            variant="ghost"
            size="sm"
            className={`h-5 px-1 gap-1 ${replyData.userVote === "upvote" ? "text-green-600" : ""}`}
            onClick={() => handleVote("upvote")}
            disabled={isVoting || !currentUser}
          >
            {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronUp className="w-3 h-3" />}
            <span className={isVoting ? "opacity-50" : ""}>{upvoteCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-5 px-1 gap-1 ${replyData.userVote === "downvote" ? "text-red-600" : ""}`}
            onClick={() => handleVote("downvote")}
            disabled={isVoting || !currentUser}
          >
            {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
            <span className={isVoting ? "opacity-50" : ""}>{downvoteCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Comment component - UPDATED WITH SEPARATE COUNTERS
export default function PostComment({ comment: initialComment, postId, refetchPosts, postOwnerId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const [voteComment, { isLoading: isVoting }] = useVoteCommentMutation();
  const [addReply] = useAddReplyMutation();
  const [deleteComment] = useDeleteCommentMutation();

  // Local state synced from prop
  const [commentData, setCommentData] = useState(initialComment);

  // Sync when parent updates
  useEffect(() => {
    setCommentData(initialComment);
  }, [initialComment]);

  const commentUser = getUserData(commentData.user);
  const isCommentOwner = isUserOwner(commentData.user, currentUser);
  const isPostOwner = postOwnerId && isUserOwner(commentData.user, { _id: postOwnerId });
  
  // Get separate upvote and downvote counts
  const upvoteCount = typeof commentData.upvotes === 'number' 
    ? commentData.upvotes 
    : (commentData.upvotes?.length || 0);
  const downvoteCount = typeof commentData.downvotes === 'number' 
    ? commentData.downvotes 
    : (commentData.downvotes?.length || 0);

  // Direct backend sync
  const handleVote = async (type) => {
    if (!currentUser || isVoting) return;
    
    try {
      // Call backend and wait for response
      const response = await voteComment({ postId, commentId: commentData._id, type }).unwrap();
      
      // Update with EXACT backend data
      if (response.comment) {
        setCommentData(prevData => ({
          ...prevData,
          userVote: response.comment.userVote,
          upvotes: response.comment.upvotes !== undefined ? response.comment.upvotes : prevData.upvotes,
          downvotes: response.comment.downvotes !== undefined ? response.comment.downvotes : prevData.downvotes,
          replies: response.comment.replies || prevData.replies // Keep replies if not in response
        }));
      } else if (response.post) {
        // Some backends return the whole post with updated comment
        const updatedComment = response.post.comments?.find(c => c._id === commentData._id);
        if (updatedComment) {
          setCommentData(prevData => ({
            ...prevData,
            userVote: updatedComment.userVote,
            upvotes: updatedComment.upvotes !== undefined ? updatedComment.upvotes : prevData.upvotes,
            downvotes: updatedComment.downvotes !== undefined ? updatedComment.downvotes : prevData.downvotes,
            replies: updatedComment.replies || prevData.replies
          }));
        }
      }
      
      // Optional: refetch to sync everything
      if (refetchPosts) {
        setTimeout(() => refetchPosts(), 100);
      }
    } catch (error) {
      console.error('Vote comment failed:', error);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      const response = await addReply({ postId, commentId: commentData._id, text: replyText }).unwrap();
      setReplyText("");
      setShowReply(false);
      
      // Update replies if response contains them
      if (response.comment?.replies) {
        setCommentData(prevData => ({
          ...prevData,
          replies: response.comment.replies
        }));
      }
      
      if (refetchPosts) refetchPosts();
    } catch (error) {
      console.error('Add reply failed:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment({ postId, commentId: commentData._id }).unwrap();
      if (refetchPosts) refetchPosts();
    } catch (error) {
      console.error('Delete comment failed:', error);
      alert('Failed to delete comment: ' + (error.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="flex-shrink-0 w-8 h-8">
        <AvatarImage src={commentUser.profilePicture} />
        <AvatarFallback>{commentUser.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{commentUser.name}</span>
            {commentUser.verified && <Badge variant="secondary" className="h-4 text-xs">Verified</Badge>}
            {isPostOwner && <Badge variant="outline" className="h-4 text-xs">OP</Badge>}
            <span className="text-xs text-gray-500">
              {new Date(commentData.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {isCommentOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeleteComment} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <p className="mb-2 text-sm">{commentData.text}</p>
        
        {/* Separate vote counters display */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 gap-1 ${commentData.userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
              disabled={isVoting || !currentUser}
            >
              {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronUp className="w-3 h-3" />}
              <span className={isVoting ? "opacity-50" : ""}>{upvoteCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 gap-1 ${commentData.userVote === "downvote" ? "text-red-600" : ""}`}
              onClick={() => handleVote("downvote")}
              disabled={isVoting || !currentUser}
            >
              {isVoting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
              <span className={isVoting ? "opacity-50" : ""}>{downvoteCount}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => setShowReply(!showReply)}
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>

        {/* Reply input */}
        {showReply && (
          <div className="flex gap-2 mt-3">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={handleAddReply} disabled={!replyText.trim()}>
                Post
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowReply(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {commentData.replies && commentData.replies.length > 0 && (
          <div className="pl-4 mt-3 space-y-3 border-l-2 border-gray-200">
            {commentData.replies.map((reply) => (
              <ReplyComment 
                key={reply._id} 
                reply={reply} 
                postId={postId} 
                commentId={commentData._id}
                refetchPosts={refetchPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}