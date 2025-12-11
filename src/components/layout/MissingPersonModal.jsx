import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateDraft,
  clearDraft,
  closeModal,
} from "@/lib/redux/slices/missingPersonSlice";
import { 
  useCreateMissingPersonMutation, 
  useUpdateMissingPersonMutation 
} from "@/lib/redux/api/missingPersonsApi";
import { Button } from "@/components/ui/button";
import { X, Pencil, Plus, Loader2, Trash2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";

const MAX_PHOTOS = 5;

export default function MissingPersonModal() {
  const dispatch = useDispatch();
  const { isOpen, draft, isEditMode, editId } = useSelector((s) => s.missingPerson);
  const [createMissingPerson, { isLoading: isCreating }] = useCreateMissingPersonMutation();
  const [updateMissingPerson, { isLoading: isUpdating }] = useUpdateMissingPersonMutation();

  const isLoading = isCreating || isUpdating;

  const [step, setStep] = useState(1);
  const [mainIndex, setMainIndex] = useState(0);
  const fileInputRef = useRef(null);
  
  // Store new file objects for upload
  const [newFiles, setNewFiles] = useState([]);
  // Track existing photo count
  const [existingPhotoCount, setExistingPhotoCount] = useState(0);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(undefined);
  const [previewHeight, setPreviewHeight] = useState(384);

  // Initialize existing photos count when modal opens in edit mode
  useEffect(() => {
    if (isOpen && isEditMode) {
      const existingCount = draft.photos.filter(p => 
        typeof p === 'object' && (p.original || p.cropped)
      ).length;
      setExistingPhotoCount(existingCount);
    } else if (isOpen && !isEditMode) {
      setExistingPhotoCount(0);
    }
  }, [isOpen, isEditMode, draft.photos]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMainIndex(0);
      setNewFiles([]);
    } else {
      // Clean up blob URLs
      draft.photos.forEach(photo => {
        if (typeof photo === 'string' && photo.startsWith('blob:')) {
          URL.revokeObjectURL(photo);
        }
      });
      setNewFiles([]);
      setExistingPhotoCount(0);
    }
  }, [isOpen]);

  const step1Valid =
    draft.photos.length > 0 && draft.name && draft.age && draft.gender;
  const step2Valid =
    draft.lastSeenDate &&
    draft.lastSeenTime &&
    draft.lastSeenLocation &&
    draft.agreed;

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const selectedPhoto = draft.photos[mainIndex];
  
  // Check if selected photo is new (blob URL) or existing
  const isNewPhoto = typeof selectedPhoto === 'string' && selectedPhoto.startsWith('blob:');
  const selectedFile = isNewPhoto ? newFiles[mainIndex - existingPhotoCount] : null;

  const openFilePicker = () => {
    if (draft.photos.length >= MAX_PHOTOS) return;
    fileInputRef.current?.click();
  };

  const handleAddPhotos = (filesList) => {
    if (!filesList?.length) return;
    const remaining = MAX_PHOTOS - draft.photos.length;
    if (remaining <= 0) return;
    const files = Array.from(filesList).slice(0, remaining);
    
    // Store new files
    setNewFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const urls = files.map((f) => URL.createObjectURL(f));
    dispatch(updateDraft({ photos: [...draft.photos, ...urls] }));
    
    if (draft.photos.length === 0 && urls.length > 0) {
      setMainIndex(0);
    }
  };

  const handleRemovePhoto = (i) => {
    const isExisting = i < existingPhotoCount;
    
    if (isExisting) {
      // Mark existing photo for removal
      const photoToRemove = draft.photos[i];
      const photoId = photoToRemove._id || photoToRemove.id;
      
      if (photoId) {
        const removedPhotos = draft.removedPhotos || [];
        dispatch(updateDraft({ 
          removedPhotos: [...removedPhotos, photoId]
        }));
      }
    } else {
      // Remove new photo
      const newFileIndex = i - existingPhotoCount;
      if (draft.photos[i] && typeof draft.photos[i] === 'string') {
        URL.revokeObjectURL(draft.photos[i]);
      }
      
      const updatedNewFiles = newFiles.filter((_, idx) => idx !== newFileIndex);
      setNewFiles(updatedNewFiles);
    }
    
    // Remove from draft photos array
    const updated = draft.photos.filter((_, idx) => idx !== i);
    dispatch(updateDraft({ photos: updated }));
    
    // Adjust main index
    if (updated.length === 0) {
      setMainIndex(0);
    } else if (i === mainIndex) {
      setMainIndex(Math.max(0, i - 1));
    } else if (i < mainIndex) {
      setMainIndex((idx) => Math.max(0, idx - 1));
    }
    
    // Adjust existing count if needed
    if (isExisting) {
      setExistingPhotoCount(prev => prev - 1);
    }
  };

  const createCroppedImage = async (imageSrc, cropPx, originalFile) => {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { x, y, width, height } = cropPx;

    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));

    ctx.drawImage(
      img,
      x,
      y,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], originalFile.name || "cropped.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve({ blobUrl: URL.createObjectURL(blob), file: croppedFile });
      }, "image/jpeg", 0.92);
    });
  };

  const saveCrop = async () => {
    if (!selectedPhoto || !croppedAreaPixels || !selectedFile) {
      setCropModalOpen(false);
      return;
    }
    
    const { blobUrl, file: croppedFile } = await createCroppedImage(
      selectedPhoto, 
      croppedAreaPixels,
      selectedFile
    );
    
    // Update preview URL
    const updated = [...draft.photos];
    updated[mainIndex] = blobUrl;
    
    // Update file
    const fileIndex = mainIndex - existingPhotoCount;
    if (fileIndex >= 0) {
      const updatedFiles = [...newFiles];
      updatedFiles[fileIndex] = croppedFile;
      setNewFiles(updatedFiles);
    }
    
    dispatch(updateDraft({ photos: updated }));
    setCropModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (!step1Valid || !step2Valid) {
        toast.error("Please fill in all required fields");
        return;
      }

      const formData = new FormData();
      
      // Add text fields
      formData.append('name', draft.name);
      formData.append('age', draft.age);
      formData.append('gender', draft.gender);
      formData.append('lastSeenDate', draft.lastSeenDate);
      formData.append('lastSeenTime', draft.lastSeenTime);
      formData.append('lastSeenLocation', draft.lastSeenLocation);
      
      if (draft.clothing) formData.append('clothing', draft.clothing);
      if (draft.medical) formData.append('medical', draft.medical);
      if (draft.height) formData.append('height', draft.height);
      if (draft.build) formData.append('build', draft.build);
      if (draft.distinguishingMarks) formData.append('distinguishingMarks', draft.distinguishingMarks);
      if (draft.status) formData.append('status', draft.status);
      if (draft.details) formData.append('details', draft.details);

      // For edit: add removed photo IDs
      if (isEditMode && draft.removedPhotos && draft.removedPhotos.length > 0) {
        draft.removedPhotos.forEach(photoId => {
          formData.append('removedPhotos[]', photoId);
        });
      }

      // Add new photos only
      newFiles.forEach((file) => {
        formData.append('photos', file);
      });

      let result;
      if (isEditMode && editId) {
        result = await updateMissingPerson({ id: editId, data: formData }).unwrap();
        toast.success("Missing person report updated successfully!");
      } else {
        result = await createMissingPerson(formData).unwrap();
        toast.success("Missing person report submitted successfully!");
      }
      
      // Clean up
      draft.photos.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      setNewFiles([]);
      setExistingPhotoCount(0);
      setStep(1);
      setMainIndex(0);
      dispatch(clearDraft());
      dispatch(closeModal());
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          "Failed to submit report. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    // Clean up
    draft.photos.forEach(url => {
      if (typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setNewFiles([]);
    setExistingPhotoCount(0);
    setStep(1);
    setMainIndex(0);
    dispatch(clearDraft());
    dispatch(closeModal());
  };

  if (!isOpen) return null;

  // Get photo display source
  const getPhotoSrc = (photo) => {
    if (typeof photo === 'string') return photo; // Blob URL
    return photo?.cropped || photo?.original || photo; // Existing photo object
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={handleClose}
          className="absolute text-gray-500 top-3 right-3 hover:text-gray-700"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="mb-4 text-xl font-bold">
          {isEditMode ? 'Edit Missing Person Report' : 'Report Missing Person'}
        </h2>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 mb-2 animate-spin" />
              <p className="text-sm text-gray-600">
                {isEditMode ? 'Updating report...' : 'Submitting report...'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Photos (max {MAX_PHOTOS}) *
                </label>
                <span className="text-xs text-gray-500">
                  {draft.photos.length}/{MAX_PHOTOS}
                </span>
              </div>

              {draft.photos.length === 0 ? (
                <div
                  onClick={openFilePicker}
                  className="flex items-center justify-center w-full h-48 text-gray-600 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center">
                    <Plus className="w-8 h-8 mb-1" />
                    <span>Add Photo</span>
                  </div>
                </div>
              ) : (
                <div className="relative flex justify-center overflow-hidden bg-black rounded-lg">
                  <img
                    src={getPhotoSrc(selectedPhoto)}
                    alt="main"
                    className="object-contain w-auto"
                    style={{ maxHeight: "70vh" }}
                  />
                  <div className="absolute flex gap-2 top-2 right-2">
                    {isNewPhoto && (
                      <button
                        onClick={() => setCropModalOpen(true)}
                        className="p-1 text-white rounded-full bg-black/60 hover:bg-black"
                        title="Crop"
                        type="button"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePhoto(mainIndex)}
                      className="p-1 text-white rounded-full bg-black/60 hover:bg-black"
                      title="Remove"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {draft.photos.length < MAX_PHOTOS && (
                    <button
                      onClick={openFilePicker}
                      className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
                      title="Add more photos"
                      type="button"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleAddPhotos(e.target.files);
                  e.target.value = "";
                }}
                disabled={isLoading}
              />

              {draft.photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {draft.photos.map((photo, i) => (
                    <div
                      key={i}
                      className={`relative w-20 h-20 rounded-md overflow-hidden border cursor-pointer ${
                        i === mainIndex ? "border-black border-2" : "border-gray-300"
                      }`}
                      onClick={() => setMainIndex(i)}
                    >
                      <img
                        src={getPhotoSrc(photo)}
                        alt="thumb"
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(i);
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                        title="Remove"
                        type="button"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {draft.photos.length >= MAX_PHOTOS && (
                <p className="mt-2 text-xs text-gray-500">
                  You've reached the maximum of {MAX_PHOTOS} photos.
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="Full Name *"
              value={draft.name}
              onChange={(e) => dispatch(updateDraft({ name: e.target.value }))}
              className="w-full p-2 mb-3 border rounded-lg"
              disabled={isLoading}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Age *"
                value={draft.age}
                onChange={(e) => dispatch(updateDraft({ age: e.target.value }))}
                className="p-2 border rounded-lg"
                disabled={isLoading}
              />
              <select
                value={draft.gender}
                onChange={(e) => dispatch(updateDraft({ gender: e.target.value }))}
                className="p-2 border rounded-lg"
                disabled={isLoading}
              >
                <option value="">Gender *</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                type="text"
                placeholder="Height"
                value={draft.height || ''}
                onChange={(e) => dispatch(updateDraft({ height: e.target.value }))}
                className="p-2 border rounded-lg"
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Build"
                value={draft.build || ''}
                onChange={(e) => dispatch(updateDraft({ build: e.target.value }))}
                className="p-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>

            <textarea
              placeholder="Distinguishing marks..."
              value={draft.distinguishingMarks || ''}
              onChange={(e) => dispatch(updateDraft({ distinguishingMarks: e.target.value }))}
              className="w-full p-2 mt-3 border rounded-lg"
              disabled={isLoading}
              rows={2}
            />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={draft.lastSeenDate}
                onChange={(e) =>
                  dispatch(updateDraft({ lastSeenDate: e.target.value }))
                }
                className="p-2 border rounded-lg"
                disabled={isLoading}
              />
              <input
                type="time"
                value={draft.lastSeenTime}
                onChange={(e) =>
                  dispatch(updateDraft({ lastSeenTime: e.target.value }))
                }
                className="p-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>

            <input
              type="text"
              placeholder="Last seen location *"
              value={draft.lastSeenLocation}
              onChange={(e) =>
                dispatch(updateDraft({ lastSeenLocation: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded-lg"
              disabled={isLoading}
            />

            {isEditMode && (
              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">Status</label>
                <select
                  value={draft.status || 'Missing'}
                  onChange={(e) => dispatch(updateDraft({ status: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  disabled={isLoading}
                >
                  <option value="Missing">Missing</option>
                  <option value="Found">Found</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            )}

            <textarea
              placeholder="Clothing details..."
              value={draft.clothing || ''}
              onChange={(e) =>
                dispatch(updateDraft({ clothing: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded-lg"
              disabled={isLoading}
              rows={3}
            />

            <textarea
              placeholder="Medical conditions / other notes..."
              value={draft.medical || ''}
              onChange={(e) =>
                dispatch(updateDraft({ medical: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded-lg"
              disabled={isLoading}
              rows={3}
            />

            <textarea
              placeholder="Additional details..."
              value={draft.details || ''}
              onChange={(e) =>
                dispatch(updateDraft({ details: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded-lg"
              disabled={isLoading}
              rows={3}
            />

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={draft.agreed}
                onChange={(e) =>
                  dispatch(updateDraft({ agreed: e.target.checked }))
                }
                disabled={isLoading}
              />
              <span className="text-sm">
                I confirm this report is accurate. False reports may have legal
                consequences.
              </span>
            </label>
          </div>
        )}

        {/* Step Controls */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="px-6"
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!step1Valid || isLoading}
              className="px-6 text-white bg-black hover:bg-gray-800"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!step2Valid || isLoading}
              className="px-6 text-white bg-black hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                isEditMode ? 'Update Report' : 'Submit Report'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Cropper Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="relative w-full max-w-lg p-4 bg-white shadow-lg rounded-xl">
            <h3 className="mb-3 font-bold">Crop Photo</h3>

            <div
              className="relative w-full overflow-hidden bg-black rounded-lg"
              style={{ height: `${previewHeight}px` }}
            >
              <Cropper
                image={selectedPhoto}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                restrictPosition={false}
              />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm text-gray-600">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-sm text-gray-600">Height</label>
                <input
                  type="range"
                  min={240}
                  max={600}
                  step={10}
                  value={previewHeight}
                  onChange={(e) => setPreviewHeight(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-gray-600">Aspect:</span>
                {[
                  { label: "1:1", val: 1 },
                  { label: "4:3", val: 4 / 3 },
                  { label: "3:4", val: 3 / 4 },
                  { label: "16:9", val: 16 / 9 },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setAspect(opt.val)}
                    className={`text-xs px-2 py-1 rounded border ${
                      aspect === opt.val
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    }`}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button 
                  variant="outline" 
                  onClick={() => setCropModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveCrop}
                  className="text-white bg-black hover:bg-gray-800"
                >
                  Save Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}