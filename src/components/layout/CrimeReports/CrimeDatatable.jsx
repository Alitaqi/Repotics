"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Search, MoreVertical, FileText, CalendarIcon,
  ChevronDown, X, ThumbsUp, ThumbsDown, MessageCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, Flag
} from "lucide-react"
import { useGetCrimeReportsQuery, useGetPostByIdQuery } from "@/lib/redux/api/dashboardApi"
import PostModal from "@/components/layout/PostModal"
import AISummaryModal from "../CrimeReports/AISummaryModal"
import { useUpdatePostStatusMutation } from "@/lib/redux/api/dashboardApi"

const crimeTypes = [
  "Theft","Murder","Harassment","Fraud","Cybercrime","Kidnapping","Drugs",
  "Vandalism","Assault","Domestic Violence","Robbery","Bribery",
  "Extortion","Stalking","Human Trafficking","Illegal Weapons","Arson","Other"
]

const statusOptions = ["Reported","Under Investigation","Assigned","Resolved","Closed"]
const themeButton =
  "bg-[#1B4FCE] hover:bg-[#1B4FCE]/90 text-white";
const themeOutlineButton =
  "border-[#1B4FCE] text-[#1B4FCE] hover:bg-[#1B4FCE] hover:text-white";
const statusStyles = {
  Reported: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  "Under Investigation": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Assigned: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Resolved: "bg-green-100 text-green-700 hover:bg-green-100",
  Closed: "bg-red-100 text-red-700 hover:bg-red-100",
}



const FilterDropdown = ({ label, value, options, onChange, onClear }) => (

  
  
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className={`flex items-center justify-between gap-2 min-w-[140px] ${value ? "border-primary text-primary" : ""}`}
      >
        <span className="text-sm truncate">{value || label}</span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <X
              className="size-3 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
            />
          )}
          <ChevronDown className="size-3 text-muted-foreground" />
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-48 overflow-y-auto max-h-60">
      {options.map((o) => (
        <DropdownMenuItem
          key={o}
          onClick={() => onChange(o)}
          className={value === o ? "bg-muted font-medium" : ""}
        >
          {o}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)


  
const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"

// Separate component so the query only fires when a post is selected
const PostModalWrapper = ({ selectedPostId, onClose, refetch }) => {
  const { data, isLoading } = useGetPostByIdQuery(selectedPostId, {
    skip: !selectedPostId,
  })
  
 

  

  if (isLoading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Skeleton className="w-[800px] h-[500px] rounded-2xl" />
    </div>
  )

  

  return (
    <PostModal
      selectedPostId={selectedPostId}
      handleClosePost={onClose}
      post={data?.data || null}
      refetchPosts={refetch}
    />
  )
}

const CrimeDatatable = () => {
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [status, setStatus] = useState("")
  const [crimeType, setCrimeType] = useState("")
  const [page, setPage] = useState(1)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPostId, setAiPostId] = useState(null)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const debounceRef = React.useRef(null)
  const [updateStatus] = useUpdatePostStatusMutation()

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap()

      // refresh table
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await Promise.all(
        selected.map((id) =>
          updateStatus({ id, status: newStatus }).unwrap()
        )
      )

      setSelected([]) // clear selection
      refetch()

    } catch (err) {
      console.error("Bulk update failed:", err)
    }
  }
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, isError, refetch } = useGetCrimeReportsQuery({
    search: debouncedSearch,
    status,
    crimeType,
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    page,
    limit: 10,
  })
  
  const { data: aiPostData } = useGetPostByIdQuery(aiPostId, {
    skip: !aiPostId,
  })

  const posts = data?.data || []
  const pagination = data?.pagination || {}

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const hasFilters = search || selectedDate || status || crimeType

  const resetFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setSelectedDate(null)
    setStatus("")
    setCrimeType("")
    setPage(1)
  }

  const getPageNumbers = () => {
    const total = pagination.totalPages || 1
    const delta = 1
    const range = []
    for (let i = Math.max(2, page - delta); i <= Math.min(total - 1, page + delta); i++) {
      range.push(i)
    }
    const pages = [1]
    if (range[0] > 2) pages.push("...")
    pages.push(...range)
    if (range[range.length - 1] < total - 1) pages.push("...")
    if (total > 1) pages.push(total)
    return pages
  }

  return (
    <div className="w-full p-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-1/2">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by reporter name or location..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center w-full gap-2 lg:w-1/2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center justify-between gap-2 min-w-[140px] ${selectedDate ? "border-primary text-primary" : ""}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      <span className="text-sm truncate">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Date"}
                      </span>
                    </div>
                    {selectedDate && (
                      <X
                        className="size-3 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={(e) => { e.stopPropagation(); setSelectedDate(null); setPage(1); }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setPage(1); }} />
                </PopoverContent>
              </Popover>

              <FilterDropdown label="Status" value={status} options={statusOptions}
                onChange={(v) => { setStatus(v); setPage(1); }} onClear={() => { setStatus(""); setPage(1); }} />

              <FilterDropdown label="Crime Type" value={crimeType} options={crimeTypes}
                onChange={(v) => { setCrimeType(v); setPage(1); }} onClear={() => { setCrimeType(""); setPage(1); }} />

              {hasFilters && (
                <Button variant="ghost" size="sm" className={`shrink-0 text-muted-foreground  ${themeOutlineButton}`} onClick={resetFilters}>
                  Reset
                </Button>
              )}
              {selected.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className={`ml-2 ${themeButton}`}>
                      Change Status ({selected.length})
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {statusOptions.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => handleBulkStatusChange(s)}
                      >
                        Mark as {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={
                        posts.length > 0 && selected.length === posts.length
                      }
                      indeterminate={
                        selected.length > 0 && selected.length < posts.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelected(posts.map((p) => p._id)) // select all
                        } else {
                          setSelected([]) // clear all
                        }
                      }}
                    />
                  </th>
                  <th className="p-3 text-sm font-medium text-left">Reporter</th>
                  <th className="p-3 text-sm font-medium text-left">Crime</th>
                  <th className="p-3 text-sm font-medium text-left">Location</th>
                  <th className="p-3 text-sm font-medium text-left">Date & Time</th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><ThumbsUp className="size-3" /> Upvotes</div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><ThumbsDown className="size-3" /> Downvotes</div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><MessageCircle className="size-3" /> Comments</div>
                  </th>
                   <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1">
                      <Flag className="size-3" /> Flags
                    </div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">Status</th>
                  <th className="p-3 text-sm font-medium text-left">AI</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      {[...Array(11)].map((_, j) => (
                        <td key={j} className="p-3"><Skeleton className="w-full h-4" /></td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-sm text-center text-muted-foreground">
                      Failed to load crime reports
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-sm text-center text-muted-foreground">
                      No crime reports found
                    </td>
                  </tr>
                ) : (
                  posts.map((item) => (
                    <tr
                      key={item._id}
                      className="transition-colors border-b cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPostId(item._id)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(item._id)}
                          onCheckedChange={(checked) => {
                            setSelected((prev) =>
                              checked
                                ? [...prev, item._id]
                                : prev.filter((id) => id !== item._id)
                            )
                          }}
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 shrink-0">
                            {item.reporter.profilePicture && (
                              <AvatarImage src={item.reporter.profilePicture} />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(item.reporter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.reporter.name}</p>
                            <p className="text-xs truncate text-muted-foreground">{item.reporter.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-sm">{item.crimeType}</td>

                      <td className="p-3 text-sm max-w-[140px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 shrink-0 text-muted-foreground" />
                          <span className="truncate max-w-[110px] cursor-default" title={item.location}>
                            {item.location}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-sm">
                        {item.date}
                        <br />
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </td>

                      <td className="p-3 text-sm font-medium text-green-600">{item.upvotes}</td>
                      <td className="p-3 text-sm font-medium text-red-500">{item.downvotes}</td>
                      <td className="p-3 text-sm text-muted-foreground">{item.comments}</td>
                      <td className="p-3 text-sm">
                        {item.flagCount > 0 ? (
                          <span className="font-medium text-red-500">{item.flagCount}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${statusStyles[item.status]}`}>
                          {item.status}
                        </Badge>
                      </td>

                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          onClick={() => {
                            setAiPostId(item._id)
                            setAiModalOpen(true)
                          }}
                          className="text-xs text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
                        >
                          <FileText className="mr-1 size-3.5" />
                          AI Summary
                        </Button>
                      </td>

                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Under Investigation")}>Mark as Under Investigation</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Assigned")}>Mark as Assigned</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Resolved")}>Mark as Resolved</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Closed")} className="text-destructive">Close Case</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 border-t sm:flex-row">
              <p className="text-sm text-muted-foreground shrink-0">
                Showing <span className="font-medium text-foreground">{((page - 1) * 10) + 1}</span>–<span className="font-medium text-foreground">{Math.min(page * 10, pagination.total)}</span> of <span className="font-medium text-foreground">{pagination.total}</span> reports
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-8" disabled={page === 1} onClick={() => setPage(1)}>
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                  ) : (
                    <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className={`text-xs size-8 ${
                      page === p
                        ? "bg-[#1B4FCE] hover:bg-[#1B4FCE]/90 text-white"
                        : "text-[#1B4FCE] hover:bg-[#1B4FCE]/10"
                    }`} onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  )
                )}
                <Button variant="outline" size="icon" className="size-8" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="outline" size="icon" className="size-8" disabled={page === pagination.totalPages} onClick={() => setPage(pagination.totalPages)}>
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Modal */}
      {selectedPostId && (
        <PostModalWrapper
          selectedPostId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          refetch={refetch}
        />
      )}

      {aiModalOpen && (
      <AISummaryModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        post={aiPostData?.data}
      />
    )}
    </div>
  )
}

export default CrimeDatatable