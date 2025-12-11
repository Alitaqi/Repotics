import { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Reply, MoreHorizontal, Trash2 } from "lucide-react";
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
} from "@/lib/redux/api/missingPersonsApi";

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

// Reply component
function ReplyComment({ reply, missingPersonId, commentId, refetch }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [voteReply] = useVoteReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  
  const replyUser = getUserData(reply.user);
  const isReplyOwner = isUserOwner(reply.user, currentUser);
  const netVotes = (reply.upvotes?.length || 0) - (reply.downvotes?.length || 0);

  const handleVote = async (type) => {
    if (!currentUser) return;
    
    try {
      await voteReply({ 
        id: missingPersonId, 
        commentId, 
        replyId: reply._id, 
        type 
      }).unwrap();
      if (refetch) refetch();
    } catch (error) {
      console.error('Vote reply failed:', error);
    }
  };

  const handleDeleteReply = async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await deleteReply({ 
        id: missingPersonId, 
        commentId, 
        replyId: reply._id 
      }).unwrap();
      if (refetch) refetch();
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
            {new Date(reply.createdAt).toLocaleDateString()}
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
        
        <p className="mb-1 text-xs">{reply.text}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-5 px-1 ${reply.userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <span>{netVotes}</span>
            <Button
              variant="ghost"
              size="sm"
              className={`h-5 px-1 ${reply.userVote === "downvote" ? "text-red-600" : ""}`}
              onClick={() => handleVote("downvote")}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Comment component
export default function MissingPersonComment({ comment, missingPersonId, refetch, reportedById }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  
  const [voteComment] = useVoteCommentMutation();
  const [addReply] = useAddReplyMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const commentUser = getUserData(comment.user);
  const isCommentOwner = isUserOwner(comment.user, currentUser);
  const isReporter = reportedById && isUserOwner(comment.user, { _id: reportedById });
  const netVotes = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);

  const handleVote = async (type) => {
    if (!currentUser) return;
    
    try {
      await voteComment({ 
        id: missingPersonId, 
        commentId: comment._id, 
        type 
      }).unwrap();
      if (refetch) refetch();
    } catch (error) {
      console.error('Vote comment failed:', error);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      await addReply({ 
        id: missingPersonId, 
        commentId: comment._id, 
        text: replyText 
      }).unwrap();
      setReplyText("");
      setShowReply(false);
      if (refetch) refetch();
    } catch (error) {
      console.error('Add reply failed:', error);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment({ 
        id: missingPersonId, 
        commentId: comment._id 
      }).unwrap();
      if (refetch) refetch();
    } catch (error) {
      console.error('Delete comment failed:', error);
      alert('Failed to delete comment: ' + (error.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="flex gap-3 p-4 bg-white border rounded-lg">
      <Avatar className="flex-shrink-0 w-8 h-8">
        <AvatarImage src={commentUser.profilePicture} />
        <AvatarFallback>{commentUser.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{commentUser.name}</span>
            {commentUser.verified && <Badge variant="secondary" className="h-4 text-xs">Verified</Badge>}
            {isReporter && <Badge variant="outline" className="h-4 text-xs">Reporter</Badge>}
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
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
        
        <p className="mb-2 text-sm">{comment.text}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 ${comment.userVote === "upvote" ? "text-green-600" : ""}`}
              onClick={() => handleVote("upvote")}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <span>{netVotes}</span>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-1 ${comment.userVote === "downvote" ? "text-red-600" : ""}`}
              onClick={() => handleVote("downvote")}
            >
              <ChevronDown className="w-3 h-3" />
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
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-4 mt-3 space-y-3 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <ReplyComment 
                key={reply._id} 
                reply={reply} 
                missingPersonId={missingPersonId} 
                commentId={comment._id}
                refetch={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}