// components/Reporting/PostApproval.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDraft } from "@/lib/redux/slices/reportSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit2, Save, X, Loader2, ChevronUp, ChevronDown, Sparkles } from "lucide-react";

export default function PostApproval({ 
  open, 
  onOpenChange, 
  onApprove, 
  onClose, 
  postData, 
  aiGeneratedSummary, 
  isLoading 
}) {
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);
  
  // Use AI summary if available, otherwise use description
  const initialSummary = aiGeneratedSummary || postData?.aiSummary || draft.incidentDescription || "";
  
  // Local state for editing summary
  const [isEditing, setIsEditing] = useState(false);
  const [tempSummary, setTempSummary] = useState(initialSummary);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  
  const images = useMemo(() => postData?.images || draft.images || [], [postData, draft.images]);
  const activeImage = useMemo(() => images[currentImageIndex]?.url, [images, currentImageIndex]);
  const textAreaRef = useRef(null);
  const summaryContainerRef = useRef(null);
  
  // Update tempSummary when aiGeneratedSummary changes
  useEffect(() => {
    if (aiGeneratedSummary) {
      setTempSummary(aiGeneratedSummary);
    }
  }, [aiGeneratedSummary]);
  
  // Handle scroll visibility for summary
  useEffect(() => {
    const checkScroll = () => {
      if (summaryContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = summaryContainerRef.current;
        setShowScrollUp(scrollTop > 10);
        setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10);
      }
    };
    
    if (summaryContainerRef.current) {
      summaryContainerRef.current.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      
      return () => {
        summaryContainerRef.current?.removeEventListener('scroll', checkScroll);
      };
    }
  }, [isEditing, tempSummary]);
  
  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      // Move cursor to end
      textAreaRef.current.selectionStart = textAreaRef.current.value.length;
      textAreaRef.current.selectionEnd = textAreaRef.current.value.length;
    }
  }, [isEditing]);
  
  const handleSummarySave = () => {
    if (tempSummary.trim()) {
      // Update the draft with edited summary
      dispatch(updateDraft({ incidentDescription: tempSummary }));
    }
    setIsEditing(false);
  };
  
  const handleSummaryCancel = () => {
    setTempSummary(initialSummary);
    setIsEditing(false);
  };
  
  const handleApprove = () => {
    if (onApprove) onApprove(tempSummary); // Pass edited summary to approval handler
  };
  
  const handleCancel = () => {
    if (onClose) onClose();
    onOpenChange(false);
  };
  
  // Scroll helpers
  const scrollSummaryUp = () => {
    if (summaryContainerRef.current) {
      summaryContainerRef.current.scrollBy({ top: -50, behavior: 'smooth' });
    }
  };
  
  const scrollSummaryDown = () => {
    if (summaryContainerRef.current) {
      summaryContainerRef.current.scrollBy({ top: 50, behavior: 'smooth' });
    }
  };
  
  // Check if we have AI-generated summary
  const hasAiSummary = !!aiGeneratedSummary;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden bg-white border-0 sm:max-w-xl md:max-w-2xl">
        <DialogHeader className="px-4 pt-3 pb-3 border-b sm:px-6 sm:pt-4 sm:pb-4">
          <DialogTitle className="text-lg text-center sm:text-xl md:text-2xl">
            Review AI Summary & Approve
          </DialogTitle>
          <p className="text-xs text-center text-gray-500 sm:text-sm">
            {hasAiSummary 
              ? "Review and edit the AI-generated summary before publishing" 
              : "Review your post before publishing"}
          </p>
        </DialogHeader>
        
        {/* Body */}
        <div className="px-4 pb-3 sm:px-6 sm:pb-4">
          {/* Images Carousel */}
          {images.length > 0 ? (
            <div className="relative h-[200px] sm:h-[250px] md:h-[300px] w-full bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
              {/* Current Image */}
              <img 
                src={activeImage} 
                alt="post preview" 
                className="object-contain w-full h-full bg-black"
              />
              
              {/* Navigation Arrows */}
              {currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(i => i - 1)}
                  className="absolute p-1.5 sm:p-2 text-white -translate-y-1/2 rounded-full left-2 sm:left-3 top-1/2 bg-black/60 hover:bg-black/80 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              
              {currentImageIndex < images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(i => i + 1)}
                  className="absolute p-1.5 sm:p-2 text-white -translate-y-1/2 rounded-full right-2 sm:right-3 top-1/2 bg-black/60 hover:bg-black/80 transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              
              {/* Pagination Dots */}
              <div className="absolute left-0 right-0 flex items-center justify-center gap-1.5 sm:gap-2 bottom-3">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? "bg-white scale-125" 
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Image Count */}
              <div className="absolute px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white rounded-full top-2 sm:top-3 right-2 sm:right-3 bg-black/70">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[150px] sm:h-[180px] mb-3 sm:mb-4 border-2 border-dashed rounded-lg sm:rounded-xl bg-gray-50">
              <p className="mb-1.5 sm:mb-2 text-sm sm:text-base text-gray-500">No images selected</p>
              <p className="text-xs text-gray-400 sm:text-sm">Images will appear here</p>
            </div>
          )}
          
          {/* AI Summary/Description Section */}
          <div className="p-3 border rounded-lg sm:p-4 sm:rounded-xl bg-gray-50">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
                    {hasAiSummary ? "AI-Generated Summary" : "Post Summary"}
                  </h3>
                  {hasAiSummary && (
                    <div className="flex items-center gap-1 px-2 py-0.5 text-xs text-purple-700 bg-purple-100 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      <span>AI</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {hasAiSummary 
                    ? "Edit the AI-generated summary if needed" 
                    : "Edit your post description"}
                </p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-600 transition bg-white border border-blue-200 rounded-md sm:rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleSummarySave}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-green-600 transition bg-white border border-green-200 rounded-md sm:rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleSummaryCancel}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 transition bg-white border border-gray-200 rounded-md sm:rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Editable Summary Area */}
            {isEditing ? (
              <div className="relative">
                <textarea
                  ref={textAreaRef}
                  value={tempSummary}
                  onChange={(e) => setTempSummary(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 sm:p-3 pr-8 sm:pr-10 text-sm sm:text-base text-gray-800 border rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto"
                  placeholder="Edit the AI-generated summary..."
                  disabled={isLoading}
                  style={{
                    maxHeight: '150px',
                    minHeight: '80px'
                  }}
                />
                <div className="absolute flex flex-col gap-0.5 sm:gap-1 top-2.5 sm:top-3 right-2 sm:right-3">
                  {showScrollUp && (
                    <button
                      type="button"
                      onClick={scrollSummaryUp}
                      className="p-0.5 sm:p-1 text-gray-500 transition bg-white rounded hover:bg-gray-100"
                      aria-label="Scroll up"
                    >
                      <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  )}
                  {showScrollDown && (
                    <button
                      type="button"
                      onClick={scrollSummaryDown}
                      className="p-0.5 sm:p-1 text-gray-500 transition bg-white rounded hover:bg-gray-100"
                      aria-label="Scroll down"
                    >
                      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                  Character count: {tempSummary.length}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={summaryContainerRef}
                  className="p-2.5 sm:p-3 pr-8 sm:pr-10 bg-white border rounded-md sm:rounded-lg text-sm sm:text-base max-h-[150px] overflow-y-auto"
                  style={{
                    minHeight: '80px'
                  }}
                >
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {tempSummary || (
                      <span className="italic text-gray-400">No summary available</span>
                    )}
                  </p>
                </div>
                {/* Scroll indicators for non-editing mode */}
                <div className="absolute flex flex-col gap-0.5 sm:gap-1 top-2.5 sm:top-3 right-2 sm:right-3">
                  {showScrollUp && (
                    <button
                      type="button"
                      onClick={scrollSummaryUp}
                      className="p-0.5 sm:p-1 text-gray-500 transition bg-white rounded hover:bg-gray-100"
                      aria-label="Scroll up"
                    >
                      <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  )}
                  {showScrollDown && (
                    <button
                      type="button"
                      onClick={scrollSummaryDown}
                      className="p-0.5 sm:p-1 text-gray-500 transition bg-white rounded hover:bg-gray-100"
                      aria-label="Scroll down"
                    >
                      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  )}
                </div>
                {tempSummary && (
                  <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                    {tempSummary.length} characters
                  </p>
                )}
              </div>
            )}
            
            
            {/* Anonymous Badge */}
            {(postData?.anonymous || draft.anonymous) && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-md sm:rounded-lg">
                <span className="text-yellow-600">👤</span>
                This post will be published anonymously
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with Approval Buttons */}
        <DialogFooter className="flex items-center justify-between gap-2 px-4 pb-4 sm:gap-3 sm:px-6 sm:pb-6">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm border-gray-300"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Cancel</span>
          </Button>
          
          <Button
            onClick={handleApprove}
            disabled={isLoading || !tempSummary?.trim()}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <span className="text-base sm:text-lg">✓</span>
                <span>Approve & Publish</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}