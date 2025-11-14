// components/layout/DeletePostDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeletePostDialog({ 
  open, 
  onOpenChange, 
  post, 
  onDelete,
  isLoading = false 
}) {
  const handleConfirm = () => {
    onDelete(post._id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>Are you sure you want to delete this post? This action cannot be undone.</p>
          
          {post?.crimeType && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium">Post Type: {post.crimeType}</p>
              <p className="text-sm text-gray-600 truncate">
                {post.description?.substring(0, 100)}...
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Post"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}