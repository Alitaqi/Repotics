import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Flag, Loader2 } from "lucide-react"
import { useState } from "react"

const FLAG_REASONS = [
  { value: "Spam", label: "Spam", description: "This post is spam or advertising" },
  { value: "False Information", label: "False Information", description: "This report contains false or misleading info" },
  { value: "Inappropriate Content", label: "Inappropriate Content", description: "This content is offensive or disturbing" },
  { value: "Harassment", label: "Harassment", description: "This post is targeting or harassing someone" },
  { value: "Duplicate Report", label: "Duplicate Report", description: "This incident has already been reported" },
  { value: "Other", label: "Other", description: "Another reason not listed here" },
]

export default function FlagDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const [selected, setSelected] = useState(null)

  const handleSubmit = () => {
    if (!selected) return
    onSubmit(selected)
  }

  const handleClose = (val) => {
    onOpenChange(val)
    if (!val) setSelected(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="text-red-500 size-4" />
            Report this Post
          </DialogTitle>
          <DialogDescription>
            Why are you flagging this post? Your report helps keep the community safe.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelected(reason.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selected === reason.value
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className="text-sm font-medium">{reason.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{reason.description}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => handleClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-white bg-red-600 hover:bg-red-700"
            disabled={!selected || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Flag className="mr-2 size-4" />}
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}