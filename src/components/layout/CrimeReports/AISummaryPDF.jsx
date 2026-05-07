"use client"

import { format } from "date-fns"

const AISummaryPDF = ({ post }) => {
  const ai = post.aiReport || {}

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#000",
        padding: "24px",
        width: "794px", // A4 width in px
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: "20px", marginBottom: "4px" }}>
        AI Investigation Report
      </h1>
      <p style={{ fontSize: "12px", color: "#555" }}>
        Generated at: {format(new Date(), "PPP p")}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* SUMMARY */}
      <h3>Status</h3>
      <p>{post.status}</p>

      <h3>Crime Type</h3>
      <p>{post.crimeType}</p>

      <h3>Engagement</h3>
      <p>Upvotes: {post.upvotes.length}</p>
      <p>Downvotes: {post.downvotes.length}</p>

      <hr style={{ margin: "16px 0" }} />

      {/* REPORTER */}
      <h3>Reporter</h3>
      <p>Name: {post.user?.name}</p>
      <p>Email: {post.user?.email}</p>

      <hr style={{ margin: "16px 0" }} />

      {/* INCIDENT */}
      <h3>Incident</h3>
      <p>{post.incidentDescription}</p>
      <p>
        {post.date} - {post.time}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* AI SUMMARY */}
      <h3>AI Summary</h3>
      <p>{ai.shortSummary || "N/A"}</p>

      {/* FULL REPORT */}
      <h3>Full Report</h3>
      <p style={{ whiteSpace: "pre-line" }}>
        {ai.fullReport || "N/A"}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* EXTRACTED */}
      <h3>Extracted Data</h3>
      <p>Weapons: {ai.extracted?.weapons?.join(", ") || "N/A"}</p>
      <p>Vehicles: {ai.extracted?.vehicleTypes?.join(", ") || "N/A"}</p>
      <p>Plates: {ai.extracted?.licensePlates?.join(", ") || "N/A"}</p>
      <p>Suspects: {ai.extracted?.suspectsCount ?? "N/A"}</p>
      <p>Faces: {ai.extracted?.facesDetected ?? "N/A"}</p>
      <p>OCR: {ai.extracted?.ocrText || "N/A"}</p>

      <hr style={{ margin: "16px 0" }} />

      {/* CONFIDENCE */}
      <h3>Confidence</h3>
      <p>
        {ai.confidenceScore
          ? `${(ai.confidenceScore * 100).toFixed(1)}%`
          : "N/A"}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* REVIEW */}
      <h3>Review</h3>
      <p>Reviewed: {ai.reviewedByUser ? "Yes" : "No"}</p>
      <p>
        Reviewed At:{" "}
        {ai.reviewedAt
          ? format(new Date(ai.reviewedAt), "PPP p")
          : "N/A"}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {/* AUDIT */}
      <h3>Audit</h3>
      <p>Opened At: {format(new Date(), "PPP p")}</p>
    </div>
  )
}

export default AISummaryPDF