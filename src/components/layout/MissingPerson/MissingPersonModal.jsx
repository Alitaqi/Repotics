"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useGetMissingPersonByIdQuery } from "@/lib/redux/api/dashboardApi"
import jsPDF from "jspdf"
import {
  User, MapPin, Calendar, Clock, Ruler, Tag,
  Shirt, Stethoscope, FileText, Download
} from "lucide-react"

const statusStyles = {
  Missing: "bg-red-500/20 text-red-300 border border-red-400/30",
  Found: "bg-green-500/20 text-green-300 border border-green-400/30",
  Unknown: "bg-gray-500/20 text-gray-300 border border-gray-400/30",
}

const Field = ({ icon: Icon, label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-md bg-white/5 shrink-0">
        <Icon className="size-3.5 text-white/50" />
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm text-white/85">{value}</p>
      </div>
    </div>
  )
}

const Section = ({ title, color = "text-blue-300", children }) => (
  <div className="p-5 border rounded-xl border-white/10 bg-white/5">
    <h3 className={`text-sm font-semibold mb-4 ${color}`}>{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
)

const MissingPersonModalContent = ({ id, onClose }) => {
  const { data, isLoading } = useGetMissingPersonByIdQuery(id)
  const person = data?.data

  const handleExportPDF = async () => {
    if (!person) return

    const toBase64 = (url) =>
    new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext("2d").drawImage(img, 0, 0)
        resolve(canvas.toDataURL("image/jpeg"))
      }
      img.onerror = () => resolve(null) // skip if fails
      img.src = url
    })

    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = 20

    const checkNewPage = (needed = 20) => {
      if (y + needed > pageHeight - margin) {
        pdf.addPage()
        pdf.setFillColor(15, 23, 42)
        pdf.rect(0, 0, pageWidth, pageHeight, "F")
        y = margin
      }
    }

    const addSectionTitle = (title, color = [100, 150, 255]) => {
      checkNewPage(14)
      y += 4
      pdf.setFillColor(30, 35, 60)
      pdf.roundedRect(margin, y - 5, contentWidth, 10, 2, 2, "F")
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(...color)
      pdf.text(title, margin + 3, y + 1)
      y += 10
    }

    const addLabel = (label, value, x = margin) => {
      if (!value) return
      checkNewPage(8)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(150, 150, 180)
      pdf.text(label + ":", x, y)
      pdf.setTextColor(220, 220, 240)
      const lines = pdf.splitTextToSize(String(value), contentWidth - 35)
      pdf.text(lines, x + 35, y)
      y += lines.length * 4 + 2
    }

    // ── Dark background ──
    pdf.setFillColor(15, 23, 42)
    pdf.rect(0, 0, pageWidth, pageHeight, "F")

    // ── Header ──
    pdf.setFillColor(20, 30, 60)
    pdf.rect(0, 0, pageWidth, 28, "F")
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(255, 255, 255)
    pdf.text("Missing Person Report", margin, 13)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(130, 140, 180)
    pdf.text(
      `Case ID: ${person._id}  •  Generated: ${format(new Date(), "PPP p")}`,
      margin, 21
    )
    y = 36

    // ── Status + KPI cards ──
    const cardW = (contentWidth - 6) / 3
    const kpis = [
      { label: "Status", value: person.status, color: [234, 179, 8] },
      { label: "Upvotes", value: person.upvotes?.length ?? 0, color: [74, 222, 128] },
      { label: "Downvotes", value: person.downvotes?.length ?? 0, color: [248, 113, 113] },
    ]
    kpis.forEach((card, i) => {
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
      pdf.text(String(card.value), x + 3, y + 14)
    })
     y += 24
    
    // ── Photos section (add this after the KPI cards block) ──
    // 
    
    const photos = person.photos || []
    if (photos.length > 0) {
      addSectionTitle("Photos", [200, 180, 255])
      
      const imgW = 40  // mm width per photo
      const imgH = 50  // mm height per photo
      const gap = 5
      const perRow = Math.floor(contentWidth / (imgW + gap))
      
      checkNewPage(imgH + 10)
      
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i].cropped || photos[i].original
        const b64 = await toBase64(url)
        if (!b64) continue

        const col = i % perRow
        const row = Math.floor(i / perRow)

        if (col === 0 && row > 0) {
          y += imgH + gap
          checkNewPage(imgH + 10)
        }

        const x = margin + col * (imgW + gap)
        pdf.addImage(b64, "JPEG", x, y, imgW, imgH)
      }

      y += imgH + 8
    }
  
    // ── Personal Information ──
    addSectionTitle("Personal Information", [100, 180, 255])
    addLabel("Full Name", person.name)
    addLabel("Age", person.age ? `${person.age} years old` : null)
    addLabel("Gender", person.gender)
    addLabel("Height", person.height)
    addLabel("Build", person.build)
    addLabel("Distinguishing Marks", person.distinguishingMarks)

    // ── Last Seen ──
    addSectionTitle("Last Seen Information", [180, 130, 255])
    addLabel("Last Seen Date", person.lastSeenDate
      ? format(new Date(person.lastSeenDate), "PPP")
      : null)
    addLabel("Last Seen Time", person.lastSeenTime)
    addLabel("Last Seen Location", person.lastSeenLocation)
    addLabel("Clothing", person.clothing)

    // ── Medical ──
    addSectionTitle("Medical Information", [100, 220, 160])
    addLabel("Medical Conditions", person.medical || "None reported")

    // ── Additional Details ──
    addSectionTitle("Additional Details", [250, 180, 80])
    checkNewPage(10)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(190, 200, 230)
    const detailLines = pdf.splitTextToSize(person.details || "None provided", contentWidth)
    detailLines.forEach((line) => {
      checkNewPage(6)
      pdf.text(line, margin, y)
      y += 4.5
    })
    y += 4

    // ── Reporter ──
    addSectionTitle("Reported By", [100, 220, 220])
    addLabel("Name", person.reportedBy?.name)
    addLabel("Email", person.reportedBy?.email)

    // ── Reported At ──
    checkNewPage(10)
    addSectionTitle("Case Metadata", [180, 150, 255])
    addLabel("Reported At", format(new Date(person.createdAt), "PPP p"))
    addLabel("Report Opened", format(new Date(), "PPP p"))

    // ── Save ──
    pdf.save(`MissingPerson_${person._id}.pdf`)
  }

  if (isLoading) return (
    <div className="p-8 space-y-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="w-full h-10 bg-white/10" />
      ))}
    </div>
  )

  if (!person) return (
    <div className="p-8 text-center text-white/50">Failed to load record</div>
  )

  const photos = person.photos || []

  return (
    <>
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Missing Person Report</h2>
            <p className="mt-1 text-xs text-white/50">
              Case ID: {person._id} • Reported: {format(new Date(person.createdAt), "PPP")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={statusStyles[person.status]}>{person.status}</Badge>
            <Button
              size="sm"
              onClick={handleExportPDF}
              className="text-xs text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
            >
              <Download className="mr-1 size-3.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-5">

          {/* Photos */}
          {photos.length > 0 && (
            <div className="flex gap-3 pb-2 overflow-x-auto">
              {photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo.cropped || photo.original}
                  alt={`Photo ${i + 1}`}
                  className="object-cover w-32 h-40 border rounded-xl border-white/10 shrink-0"
                />
              ))}
            </div>
          )}

          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 text-center border rounded-xl bg-white/5 border-white/10">
              <p className="mb-1 text-xs text-white/40">Upvotes</p>
              <p className="text-2xl font-bold text-green-400">{person.upvotes?.length || 0}</p>
            </div>
            <div className="p-4 text-center border rounded-xl bg-white/5 border-white/10">
              <p className="mb-1 text-xs text-white/40">Downvotes</p>
              <p className="text-2xl font-bold text-red-400">{person.downvotes?.length || 0}</p>
            </div>
            <div className="p-4 text-center border rounded-xl bg-white/5 border-white/10">
              <p className="mb-1 text-xs text-white/40">Comments</p>
              <p className="text-2xl font-bold text-blue-300">{person.comments?.length || 0}</p>
            </div>
          </div>

          {/* Basic Info + Last Seen */}
          <div className="grid gap-4 md:grid-cols-2">
            <Section title="Personal Information" color="text-blue-300">
              <Field icon={User} label="Full Name" value={person.name} />
              <Field icon={Tag} label="Age" value={person.age ? `${person.age} years old` : null} />
              <Field icon={User} label="Gender" value={person.gender} />
              <Field icon={Ruler} label="Height" value={person.height} />
              <Field icon={User} label="Build" value={person.build} />
              <Field icon={Tag} label="Distinguishing Marks" value={person.distinguishingMarks} />
            </Section>

            <Section title="Last Seen Information" color="text-purple-300">
              <Field
                icon={Calendar}
                label="Last Seen Date"
                value={person.lastSeenDate ? format(new Date(person.lastSeenDate), "PPP") : null}
              />
              <Field icon={Clock} label="Last Seen Time" value={person.lastSeenTime} />
              <Field icon={MapPin} label="Last Seen Location" value={person.lastSeenLocation} />
              <Field icon={Shirt} label="Clothing" value={person.clothing} />
            </Section>
          </div>

          {/* Medical + Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Section title="Medical Information" color="text-emerald-300">
              <Field icon={Stethoscope} label="Medical Conditions" value={person.medical || "None reported"} />
            </Section>

            <Section title="Additional Details" color="text-amber-300">
              <Field icon={FileText} label="Details" value={person.details || "None provided"} />
            </Section>
          </div>

          {/* Reporter */}
          <Section title="Reported By" color="text-cyan-300">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0">
                {person.reportedBy?.profilePicture && (
                  <AvatarImage src={person.reportedBy.profilePicture} />
                )}
                <AvatarFallback className="text-xs text-white bg-white/10">
                  {person.reportedBy?.name?.split(" ").map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white/85">{person.reportedBy?.name || "Unknown"}</p>
                <p className="text-xs text-white/40">{person.reportedBy?.email || "—"}</p>
              </div>
            </div>
          </Section>

        </div>
      </ScrollArea>
    </>
  )
}

const MissingPersonModal = ({ selectedId, onClose }) => {
  return (
    <Dialog open={!!selectedId} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="p-0 overflow-hidden text-white border-0 max-w-3xl h-[90vh] flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {!!selectedId && (
          <MissingPersonModalContent id={selectedId} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MissingPersonModal