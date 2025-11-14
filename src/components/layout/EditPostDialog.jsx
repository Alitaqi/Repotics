// components/layout/EditPostDialog.jsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function EditPostDialog({ 
  open, 
  onOpenChange, 
  post, 
  onSave,
  isLoading = false 
}) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (post) {
      setDescription(post.description || "");
    }
  }, [post, open]);

  const handleSave = () => {
    onSave(post._id, description);
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Post Type Badge */}
          {post.crimeType && (
            <Badge variant="secondary">{post.crimeType}</Badge>
          )}
          
          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident..."
              className="min-h-[120px]"
            />
          </div>

          {/* Images Preview */}
          {post.images && post.images.length > 0 && (
            <div>
              <label className="block mb-2 text-sm font-medium">Images</label>
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Post image ${index + 1}`}
                    className="object-cover w-full h-32 rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || !description.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}