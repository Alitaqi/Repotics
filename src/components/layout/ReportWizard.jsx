// components/Reporting/ReportWizard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  updateDraft, 
  resetReport, 
  hydrateFromStorage,
  setPostApprovalOpen,
  setPostApprovalLoading,
} from "@/lib/redux/slices/reportSlice";
import ImageStep from "@/components/Reporting/ImageStep";
import DetailsStep from "@/components/Reporting/DetailsStep";
import PostApproval from "@/components/Reporting/PostApproval";
import { useCreateReportMutation, useFinalizeReportMutation } from "@/lib/redux/api/reportApi";

const STORAGE_KEY = "reportDraft";

// 🔥 NEW: Convert base64 string back to File object
const base64ToFile = async (base64String, filename) => {
  const response = await fetch(base64String);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export default function ReportWizard({ open, onOpenChange, onPostCreated }) {
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);
  const postApproval = useSelector((s) => s.report.postApproval);
  
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [aiGeneratedSummary, setAiGeneratedSummary] = useState("");
  
  const [createReport, { isLoading: isCreatingReport }] = useCreateReportMutation();
  const [finalizeReport, { isLoading: isFinalizing }] = useFinalizeReportMutation();

  // Load draft from localStorage
  useEffect(() => {
    if (open) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          dispatch(hydrateFromStorage(parsed));
          
          // 🔥 NEW: Restore files array from base64 images
          // This ensures the files state stays in sync with Redux
          if (parsed.images && parsed.images.length > 0) {
            const restoredFiles = parsed.images.map((img) => ({
              name: img.name,
              file: null, // Will be converted on submit
            }));
            setFiles(restoredFiles);
          }
        } catch { /* empty */ }
      }
      if (!draft.date || !draft.time) {
        const now = new Date();
        dispatch(updateDraft({
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 5),
        }));
      }
    } else {
      setStep(1);
      dispatch(setPostApprovalOpen(false));
      setSubmittedData(null);
      setAiGeneratedSummary("");
    }
  }, [open]);

  // Persist draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  // Step validation
  const canGoNext = useMemo(() => 
    draft.images.length > 0 && draft.incidentDescription?.trim(), 
    [draft]
  );
  
  const canSubmit = useMemo(() => {
    if (!draft.crimeType) return false;
    if (!draft.date || !draft.time) return false;
    if (!draft.locationText?.trim()) return false;
    if (!draft.agreed) return false;
    return true;
  }, [draft]);

  const handleClose = (v) => {
    onOpenChange?.(v);
    if (!v) {
      setStep(1);
      dispatch(setPostApprovalOpen(false));
      setSubmittedData(null);
      setAiGeneratedSummary("");
    }
  };

  const handleNext = () => {
    if (step === 1 && canGoNext) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (postApproval.isOpen) {
      dispatch(setPostApprovalOpen(false));
    }
  };

  // Handle final approval (call finalize API)
  const handleFinalApproval = async (editedSummary) => {
    dispatch(setPostApprovalLoading(true));
    
    try {
      if (submittedData?.reportId) {
        await finalizeReport({
          postId: submittedData.reportId,
          description: editedSummary || aiGeneratedSummary
        }).unwrap();
        
        if (onPostCreated) onPostCreated();
        
        alert("Report published successfully!");
        handlePostApprovalClose();
      }
    } catch (err) {
      console.error("Failed to finalize report:", err);
      alert("Error publishing report. Please try again.");
    } finally {
      dispatch(setPostApprovalLoading(false));
    }
  };

  // 🔥 UPDATED: Convert base64 back to Files before submitting
  const handleSubmitFromDetailsStep = async () => {
    dispatch(setPostApprovalLoading(true));
    
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("incidentDescription", draft.incidentDescription || "");
      formData.append("crimeType", draft.crimeType);
      formData.append("date", draft.date);
      formData.append("time", draft.time);
      formData.append("locationText", draft.locationText);
      if (draft.coordinates?.lat) formData.append("lat", draft.coordinates.lat);
      if (draft.coordinates?.lng) formData.append("lng", draft.coordinates.lng);
      formData.append("anonymous", draft.anonymous);
      formData.append("agreed", draft.agreed);

      // 🔥 Convert base64 images back to File objects
      const imageFiles = await Promise.all(
        draft.images.map((img) => base64ToFile(img.url, img.name))
      );

      // Add converted files to FormData
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Call API
      const result = await createReport(formData).unwrap();

      // Store AI-generated summary
      if (result.aiSummary) {
        setAiGeneratedSummary(result.aiSummary);
        dispatch(updateDraft({ 
          aiGeneratedSummary: result.aiSummary,
          originalDescription: draft.incidentDescription
        }));
      }

      // Store submitted data for preview
      setSubmittedData({
        ...draft,
        submittedAt: new Date().toISOString(),
        reportId: result?.post?._id,
        aiSummary: result.aiSummary
      });

      // Show success preview
      dispatch(setPostApprovalOpen(true));
      
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      dispatch(setPostApprovalLoading(false));
    }
  };

  const handlePostApprovalClose = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch(resetReport());
    dispatch(setPostApprovalOpen(false));
    setSubmittedData(null);
    setAiGeneratedSummary("");
    setFiles([]); // 🔥 Clear files array
    handleClose(false);
  };

  return (
  <>
    {/* Main Wizard Dialog */}
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden bg-white border-0">
        <DialogHeader className="px-6 pt-4 pb-4 ">
          <DialogTitle className="text-xl text-center sm:text-2xl">
            {step === 1 ? "Add Photos & Description" : "Add Details"}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6">
          {step === 1 && <ImageStep files={files} setFiles={setFiles} />}
          {step === 2 && (
            <DetailsStep 
              onSubmit={handleSubmitFromDetailsStep}
              isLoading={isCreatingReport}
              canSubmit={canSubmit}
            />
          )}
        </div>

        {/* Footer controls */}
        <DialogFooter className="flex items-center justify-between gap-2 px-6 pb-6">
          {step === 2 ? (
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <Button onClick={handleNext} disabled={!canGoNext}>
              Next
            </Button>
          )}

          {step === 2 && <div />}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Post Approval Dialog */}
    <PostApproval
      open={postApproval.isOpen}
      onOpenChange={(open) => dispatch(setPostApprovalOpen(open))}
      onApprove={handleFinalApproval}
      onClose={handlePostApprovalClose}
      postData={submittedData || draft}
      aiGeneratedSummary={aiGeneratedSummary}
      isLoading={postApproval.isLoading || isFinalizing}
    />
  </>
);
}