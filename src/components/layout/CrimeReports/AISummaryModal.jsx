"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
// import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useRef } from "react"
import AISummaryPDF from "./AISummaryPDF"



const AISummaryModal = ({ open, onClose, post }) => {
  if (!post) return null

  
  const ai = post.aiReport || {}
  const pdfRef = useRef()
  const handleExportPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = 20

    // Helpers
    const addText = (text, x, fontSize = 10, style = "normal", color = [255, 255, 255]) => {
      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", style)
      pdf.setTextColor(...color)
      const lines = pdf.splitTextToSize(String(text || "N/A"), contentWidth - (x - margin))
      pdf.text(lines, x, y)
      y += lines.length * (fontSize * 0.4) + 2
    }

    const addLabel = (label, value, x = margin) => {
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(150, 150, 180)
      pdf.text(label + ":", x, y)
      pdf.setTextColor(220, 220, 240)
      const lines = pdf.splitTextToSize(String(value || "N/A"), contentWidth - (x - margin) - 30)
      pdf.text(lines, x + 30, y)
      y += lines.length * 4 + 2
    }

    const addSectionTitle = (title, color = [100, 150, 255]) => {
      checkNewPage(12)
      y += 4
      pdf.setFillColor(30, 35, 60)
      pdf.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, "F")
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(...color)
      pdf.text(title, margin + 3, y + 1)
      y += 10
    }

    const addDivider = () => {
      pdf.setDrawColor(60, 70, 100)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 4
    }

    const checkNewPage = (needed = 20) => {
      if (y + needed > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage()
        // Dark background for new page
        pdf.setFillColor(15, 23, 42)
        pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F")
        y = margin
      }
    }

    const ai = post.aiReport || {}

    // ── Background ──
    pdf.setFillColor(15, 23, 42)
    pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F")

    // ── Header ──
    pdf.setFillColor(20, 30, 60)
    pdf.rect(0, 0, pageWidth, 28, "F")
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(255, 255, 255)
    pdf.text("AI Investigation Report", margin, 13)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(130, 140, 180)
    pdf.text(`Case Intelligence Dashboard  •  Generated: ${format(new Date(), "PPP p")}`, margin, 21)
    y = 36

    // ── KPI Cards Row ──
    const cardW = (contentWidth - 9) / 4
    const cards = [
      { label: "Status", value: post.status, color: [234, 179, 8] },
      { label: "Crime Type", value: post.crimeType, color: [147, 197, 253] },
      { label: "Upvotes", value: post.upvotes?.length, color: [74, 222, 128] },
      { label: "Downvotes", value: post.downvotes?.length, color: [248, 113, 113] },
    ]
    cards.forEach((card, i) => {
      const x = margin + i * (cardW + 3)
      pdf.setFillColor(25, 35, 60)
      pdf.roundedRect(x, y, cardW, 18, 2, 2, "F")
      pdf.setFontSize(7)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(130, 140, 180)
      pdf.text(card.label, x + 3, y + 6)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(...card.color)
      pdf.text(String(card.value ?? "N/A"), x + 3, y + 14)
    })
    y += 24

    // ── Reporter + Incident ──
    addSectionTitle("Reporter Profile", [100, 180, 255])
    addLabel("Name", post.user?.name)
    addLabel("Email", post.user?.email)

    addSectionTitle("Incident Details", [180, 130, 255])
    addLabel("Description", post.incidentDescription)
    addLabel("Date & Time", `${post.date}  •  ${post.time}`)
    y += 2

    // ── AI Summary ──
    checkNewPage(30)
    addSectionTitle("AI Short Summary", [100, 180, 255])
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(200, 210, 240)
    const summaryLines = pdf.splitTextToSize(ai.shortSummary || "No summary available", contentWidth)
    checkNewPage(summaryLines.length * 4 + 6)
    pdf.text(summaryLines, margin, y)
    y += summaryLines.length * 4 + 6

    // ── Full Report ──
    checkNewPage(30)
    addSectionTitle("Full Forensic Report", [150, 130, 255])
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(190, 200, 230)
    const reportLines = pdf.splitTextToSize(ai.fullReport || "N/A", contentWidth)
    reportLines.forEach((line) => {
      checkNewPage(6)
      pdf.text(line, margin, y)
      y += 4.5
    })
    y += 4

    // ── Extracted Intelligence ──
    checkNewPage(40)
    addSectionTitle("Extracted Intelligence", [100, 220, 160])
    if (ai.extracted?.weapons?.length) {
      addLabel("Weapons", ai.extracted.weapons.join(", "))
    }
    addLabel("Vehicles", ai.extracted?.vehicleTypes?.join(", "))
    addLabel("License Plates", ai.extracted?.licensePlates?.join(", "))
    addLabel("Suspects", ai.extracted?.suspectsCount)
    addLabel("Faces Detected", ai.extracted?.facesDetected)
    addLabel("OCR Text", ai.extracted?.ocrText)
    y += 2

    // ── Confidence Score ──
    checkNewPage(22)
    addSectionTitle("AI Confidence Score", [250, 200, 80])
    const score = (ai.confidenceScore || 0) * 100
    const barW = contentWidth
    pdf.setFillColor(40, 45, 70)
    pdf.roundedRect(margin, y, barW, 5, 2, 2, "F")
    // gradient approximation — two fills
    pdf.setFillColor(234, 179, 8)
    pdf.roundedRect(margin, y, barW * (score / 100), 5, 2, 2, "F")
    y += 8
    pdf.setFontSize(8)
    pdf.setTextColor(180, 180, 200)
    pdf.text(`${score.toFixed(1)}% confidence level`, margin, y)
    y += 8

    // ── Flags ──
    if (post.flagCount > 0 && post.flagBreakdown) {
      checkNewPage(30)
      addSectionTitle("Community Flags", [255, 120, 120])
      
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(200, 180, 180)
      pdf.text(`Total flags: ${post.flagCount}`, margin, y)
      y += 6

      Object.entries(post.flagBreakdown).forEach(([reason, count]) => {
        checkNewPage(8)
        pdf.setTextColor(180, 150, 150)
        pdf.text(`• ${reason}:`, margin + 3, y)
        pdf.setTextColor(255, 120, 120)
        pdf.text(String(count), margin + 45, y)
        y += 5
      })
      y += 4
    }
    
    // ── Review Status ──
    checkNewPage(24)
    addSectionTitle("Review & Audit", [100, 220, 220])
    addLabel("Reviewed by User", ai.reviewedByUser ? "Yes" : "No")
    addLabel("Reviewed At", ai.reviewedAt ? format(new Date(ai.reviewedAt), "PPP p") : "N/A")
    addLabel("Report Opened At", format(new Date(), "PPP p"))
    y += 2
    pdf.setFontSize(7)
    pdf.setTextColor(100, 110, 140)
    pdf.text("This timestamp records AI report access for audit tracking.", margin, y)

    // ── Save ──
    pdf.save(`AI_Report_${post._id}.pdf`)
  }

  

  return (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-5xl p-0 overflow-hidden text-white border-0 min-w-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-lg font-semibold tracking-wide">
          AI Investigation Report
        </DialogTitle>
        <button
          onClick={handleExportPDF}
          className="px-4 py-1.5 mr-6  text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 ">
          Export PDF
        </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
          <span>Case Intelligence Dashboard</span>
          <span>•</span>
          <span>{format(new Date(), "PPP p")}</span>
        </div>
      </div>

      <ScrollArea className="max-h-[75vh]">
        <div  ref={pdfRef} className="p-6 space-y-6">

          {/* ===== TOP SUMMARY CARDS ===== */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            <div className="p-4 border rounded-xl bg-white/5 border-white/10">
              <p className="text-xs text-white/50">Status</p>
              <Badge className="mt-2 text-yellow-300 border bg-yellow-500/20 border-yellow-400/30">
                {post.status}
              </Badge>
            </div>

            <div className="p-4 border rounded-xl bg-white/5 border-white/10">
              <p className="text-xs text-white/50">Crime Type</p>
              <p className="mt-2 font-medium">{post.crimeType}</p>
            </div>

            <div className="p-4 border rounded-xl bg-white/5 border-white/10">
              <p className="text-xs text-white/50">Upvotes</p>
              <p className="mt-2 font-semibold text-green-400">{post.upvotes.length}</p>
            </div>

            <div className="p-4 border rounded-xl bg-white/5 border-white/10">
              <p className="text-xs text-white/50">Downvotes</p>
              <p className="mt-2 font-semibold text-red-400">{post.downvotes.length}</p>
            </div>
          </div>

          {/* ===== REPORTER + CASE INFO ===== */}
          <div className="grid gap-6 md:grid-cols-2">

            <div className="p-5 border rounded-xl border-white/10 bg-white/5">
              <h3 className="mb-3 text-sm font-semibold text-blue-300">
                Reporter Profile
              </h3>

              <div className="space-y-2 text-sm text-white/80">
                <p><span className="text-white/50">Name:</span> {post.user?.name}</p>
                <p><span className="text-white/50">Email:</span> {post.user?.email}</p>
              </div>
            </div>

            <div className="p-5 border rounded-xl border-white/10 bg-white/5">
              <h3 className="mb-3 text-sm font-semibold text-purple-300">
                Incident Details
              </h3>

              <div className="space-y-2 text-sm text-white/80">
                <p>{post.incidentDescription}</p>
                <p className="text-white/50">
                  {post.date} • {post.time}
                </p>
              </div>
            </div>
          </div>

          {/* ===== AI SUMMARY ===== */}
          <div className="p-5 border rounded-xl border-blue-500/20 bg-blue-500/10">
            <h3 className="mb-3 text-sm font-semibold text-blue-300">
              AI Short Summary
            </h3>
            <p className="text-sm leading-relaxed text-white/80">
              {ai.shortSummary || "No summary available"}
            </p>
          </div>

          {/* ===== FULL REPORT ===== */}
          <div className="p-5 border rounded-xl border-white/10 bg-white/5">
            <h3 className="mb-3 text-sm font-semibold text-indigo-300">
              Full Forensic Report
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line text-white/70">
              {ai.fullReport || "N/A"}
            </p>
          </div>

          {/* ===== EXTRACTED INTELLIGENCE ===== */}
          <div className="p-5 border rounded-xl border-white/10 bg-white/5">
            <h3 className="mb-4 text-sm font-semibold text-emerald-300">
              Extracted Intelligence
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {ai.extracted?.weapons?.map((w, i) => (
                <Badge key={i} className="text-red-300 border bg-red-500/10 border-red-400/20">
                  {w}
                </Badge>
              ))}
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2 text-white/70">
              <p><span className="text-white/50">Vehicles:</span> {ai.extracted?.vehicleTypes?.join(", ") || "N/A"}</p>
              <p><span className="text-white/50">License Plates:</span> {ai.extracted?.licensePlates?.join(", ") || "N/A"}</p>
              <p><span className="text-white/50">Suspects:</span> {ai.extracted?.suspectsCount ?? "N/A"}</p>
              <p><span className="text-white/50">Faces Detected:</span> {ai.extracted?.facesDetected ?? "N/A"}</p>
            </div>

            <div className="mt-3 text-sm text-white/70">
              <span className="text-white/50">OCR:</span>{" "}
              {ai.extracted?.ocrText || "N/A"}
            </div>
          </div>

          {/* ===== CONFIDENCE ===== */}
          <div className="p-5 border rounded-xl border-white/10 bg-white/5">
            <h3 className="mb-2 text-sm font-semibold text-yellow-300">
              AI Confidence Score
            </h3>

            <div className="w-full h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
                style={{ width: `${(ai.confidenceScore || 0) * 100}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-white/60">
              {(ai.confidenceScore ? (ai.confidenceScore * 100).toFixed(1) : 0)}% confidence level
            </p>
          </div>

          {/* ===== REVIEW + AUDIT ===== */}
          <div className="grid gap-4 md:grid-cols-2">

            <div className="p-4 border rounded-xl border-white/10 bg-white/5">
              <h3 className="mb-2 text-sm font-semibold text-cyan-300">
                Review Status
              </h3>

              <div className="space-y-1 text-sm text-white/70">
                <p>
                  Reviewed:{" "}
                  <span className={ai.reviewedByUser ? "text-green-400" : "text-red-400"}>
                    {ai.reviewedByUser ? "Yes" : "No"}
                  </span>
                </p>

                <p>
                  Reviewed At:{" "}
                  {ai.reviewedAt
                    ? format(new Date(ai.reviewedAt), "PPP p")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-xl border-white/10 bg-white/5">
              <h3 className="mb-2 text-sm font-semibold text-pink-300">
                Audit Log
              </h3>

              <p className="text-sm text-white/70">
                Opened At:{" "}
                <span className="text-white">
                  {format(new Date(), "PPP p")}
                </span>
              </p>

              <p className="mt-2 text-xs text-white/40">
                This timestamp records AI report access for audit tracking.
              </p>
            </div>
          </div>

          {/* ===== FLAGS ===== */}
          {post.flagBreakdown && Object.keys(post.flagBreakdown).length > 0 && (
            <div className="p-5 border rounded-xl border-white/10 bg-white/5">
              <h3 className="mb-3 text-sm font-semibold text-red-300">
                Community Flags ({post.flagCount || 0} total)
              </h3>
              <div className="space-y-2">
                {Object.entries(post.flagBreakdown).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{reason}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-red-400"
                          style={{
                            width: `${(count / (post.flagCount || 1)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="w-4 text-xs font-medium text-right text-red-300">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
)
}

export default AISummaryModal