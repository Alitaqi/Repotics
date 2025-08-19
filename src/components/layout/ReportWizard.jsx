import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateDraft, resetReport, hydrateFromStorage } from "@/lib/redux/slices/reportSlice";
import ImageStep from "@/components/Reporting/ImageStep";
import DetailsStep from "@/components/Reporting/DetailsStep";

const STORAGE_KEY = "reportDraft";

export default function ReportWizard({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const draft = useSelector((s) => s.report.draft);
  const [step, setStep] = useState(1);

  // Load draft from localStorage
  useEffect(() => {
    if (open) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          dispatch(hydrateFromStorage(JSON.parse(raw)));
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
    }
  }, [open]);

  // Persist draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  // Step validation
  const canGoNext = useMemo(() => draft.images.length > 0 && draft.description?.trim(), [draft]);
  const canSubmit = useMemo(() => {
    if (!draft.crimeType) return false;
    if (!draft.date || !draft.time) return false;
    if (!draft.locationText?.trim()) return false;
    if (!draft.agreed) return false;
    return true;
  }, [draft]);

  const handleClose = (v) => onOpenChange?.(v);

  const handleSubmit = () => {
    console.log("FINAL REPORT PAYLOAD:", draft);
    // TODO: dispatch API call here later

    localStorage.removeItem(STORAGE_KEY);
    dispatch(resetReport());
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden bg-white border-0">
        <DialogHeader className="px-6 pt-4 pb-4 ">
          <DialogTitle className="text-xl text-center sm:text-2xl">
            {step === 1 ? "Add Photos & Description" : "Add Details"}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-6">
          {step === 1 && <ImageStep />}
          {step === 2 && <DetailsStep />}
        </div>

        {/* Footer controls */}
        <DialogFooter className="flex items-center justify-between gap-2 px-6 pb-6">
          {step === 2 ? (
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!canGoNext}>Next</Button>
          )}

          {step === 2 && (
            <Button onClick={handleSubmit} disabled={!canSubmit}>Submit Report</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}