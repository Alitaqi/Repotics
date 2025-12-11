import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, MoreHorizontal, Flag } from "lucide-react";
import { useState } from "react";
import { 
  useGetMissingPersonByIdQuery, 
  useAddCommentMutation,
  useUpvoteMissingPersonMutation,
  useDownvoteMissingPersonMutation,
  useDeleteMissingPersonMutation
} from "@/lib/redux/api/missingPersonsApi";
import { useDispatch } from "react-redux";
import { openEditModal } from "@/lib/redux/slices/missingPersonSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MissingPersonComment from "@/components/layout/MissingPersonComment";
import MissingPersonModal from "@/components/layout/MissingPersonModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function MissingPersonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  
  // Fetch single person data
  const { 
    data: person, 
    isLoading, 
    isError,
    refetch
  } = useGetMissingPersonByIdQuery(id);
  
  // Mutations
  const [addComment] = useAddCommentMutation();
  const [upvoteMissingPerson] = useUpvoteMissingPersonMutation();
  const [downvoteMissingPerson] = useDownvoteMissingPersonMutation();
  const [deleteMissingPerson, { isLoading: isDeleting }] = useDeleteMissingPersonMutation();

  // Check ownership - handle both possible structures
  const reportedByUserId = person?.reportedBy?._id || person?.reportedBy?.userId || person?.reportedBy;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = reportedByUserId?.toString() === currentUserId?.toString();

  const handleEdit = () => {
    if (!person) return;
    
    // Prepare data for edit modal
    const editData = {
      name: person.name,
      age: person.age,
      gender: person.gender,
      height: person.height || '',
      build: person.build || '',
      distinguishingMarks: person.distinguishingMarks || '',
      lastSeenDate: person.lastSeenDate ? new Date(person.lastSeenDate).toISOString().split('T')[0] : '',
      lastSeenTime: person.lastSeenTime || '',
      lastSeenLocation: person.lastSeenLocation || '',
      clothing: person.clothing || '',
      medical: person.medical || '',
      details: person.details || '',
      status: person.status || 'Missing',
      photos: person.photos || [], // Existing photo objects
      agreed: true,
      removedPhotos: [], // Initialize empty
    };
    
    dispatch(openEditModal({ id, data: editData }));
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    
    try {
      await deleteMissingPerson(id).unwrap();
      toast.success("Missing person report deleted successfully!");
      
      // Navigate after successful deletion
      setTimeout(() => {
        navigate('/missing-persons');
      }, 1000); // Small delay to show toast
      
    } catch (error) {
      console.error("Failed to delete:", error);
      const errorMessage = error?.data?.message || 
                          error?.message ||
                          "Failed to delete report. Please try again.";
      toast.error(errorMessage);
      setShowDeleteDialog(false);
    }
  };

  const handleUpvote = async () => {
    setIsVoting(true);
    try {
      await upvoteMissingPerson(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to upvote:", error);
      toast.error("Failed to upvote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    setIsVoting(true);
    try {
      await downvoteMissingPerson(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to downvote:", error);
      toast.error("Failed to downvote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment({ id, text: newComment }).unwrap();
      setNewComment("");
      refetch();
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl p-6 mx-auto">
        <div className="mb-6">
          <Skeleton className="w-24 h-8" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="w-full h-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-48 h-10 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mb-6 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <p>Person not found.</p>
        <button
          onClick={() => navigate('/missing-persons')}
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Back to Missing Persons
        </button>
      </div>
    );
  }

  const userHasUpvoted = person.upvotes?.includes(currentUserId);
  const userHasDownvoted = person.downvotes?.includes(currentUserId);

  return (
    <>
      <div className="max-w-5xl p-6 mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mb-6 text-gray-600 transition hover:text-black"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        {/* Top-right actions */}
        <div className="relative">
          <div className="absolute top-0 right-0 z-20">
            {isOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={handleEdit} disabled={isDeleting}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Flag className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid items-start grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Images */}
          <div className="w-full">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="shadow-lg rounded-xl"
            >
              {person.photos?.length > 0 ? (
                person.photos.map((photo, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={photo.cropped || photo.original || photo}
                      alt={`${person.name} - photo ${index + 1}`}
                      className="w-full h-[400px] object-contain rounded-xl"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <img
                    src="/placeholder.png"
                    alt="No images"
                    className="w-full h-[400px] object-cover rounded-xl"
                  />
                </SwiperSlide>
              )}
            </Swiper>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">{person.name}</h1>
            <p className="mb-4 text-lg text-gray-600">
              {person.age} years old • {person.gender}
            </p>
            
            {/* Status Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                person.status === 'Found' 
                  ? 'bg-green-100 text-green-800' 
                  : person.status === 'Missing'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {person.status}
              </span>
            </div>
            
            {person.details && (
              <div className="p-3 mb-4 rounded-lg bg-gray-50">
                <p className="text-sm">{person.details}</p>
              </div>
            )}
            
            {/* Additional details */}
            <div className="mb-6 space-y-2 text-sm">
              {person.height && (
                <p><span className="font-semibold">Height:</span> {person.height}</p>
              )}
              {person.build && (
                <p><span className="font-semibold">Build:</span> {person.build}</p>
              )}
              {person.lastSeenLocation && (
                <p><span className="font-semibold">Last Seen:</span> {person.lastSeenLocation}</p>
              )}
              {person.lastSeenDate && (
                <p><span className="font-semibold">Date Last Seen:</span> {new Date(person.lastSeenDate).toLocaleDateString()}</p>
              )}
              {person.clothing && (
                <p><span className="font-semibold">Clothing:</span> {person.clothing}</p>
              )}
              {person.medical && (
                <p><span className="font-semibold">Medical Notes:</span> {person.medical}</p>
              )}
              {person.distinguishingMarks && (
                <p><span className="font-semibold">Distinguishing Marks:</span> {person.distinguishingMarks}</p>
              )}
            </div>

            {/* Upvote/Downvote */}
            <div className="flex gap-3 pb-6 mb-6 border-b">
              <Button 
                onClick={handleUpvote}
                disabled={isVoting}
                variant={userHasUpvoted ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{person.upvotes?.length || 0}</span>
              </Button>
              
              <Button 
                onClick={handleDownvote}
                disabled={isVoting}
                variant={userHasDownvoted ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{person.downvotes?.length || 0}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-xl font-semibold">
              Information / Comments ({person.comments?.length || 0})
            </h2>
          </div>

          {/* Add Comment */}
          <div className="p-4 mb-6 bg-white border rounded-lg">
            <Textarea
              placeholder="Share any information about this missing person..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {person.comments?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 rounded-lg bg-gray-50">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No comments yet. Be the first to share information!</p>
              </div>
            ) : (
              person.comments?.map((comment) => (
                <MissingPersonComment
                  key={comment._id}
                  comment={comment}
                  missingPersonId={id}
                  refetch={refetch}
                  reportedById={reportedByUserId}
                />
              ))
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the missing person report
                and all associated comments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Modal should be rendered here, not in MissingPersons page */}
      <MissingPersonModal />
    </>
  );
}