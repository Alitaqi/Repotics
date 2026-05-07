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
  Search, CalendarIcon, ChevronDown, X, MapPin,
  ThumbsUp, ThumbsDown, MessageCircle, MoreVertical,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react"
import { useGetMissingPersonsQuery } from "@/lib/redux/api/dashboardApi"
import { useUpdateMissingPersonStatusMutation } from "@/lib/redux/api/dashboardApi"
import MissingPersonModal from "@/components/layout/MissingPerson/MissingPersonModal"
// import { Dialog, DialogContent } from "@/components/ui/dialog"


const statusOptions = ["Missing", "Found", "Unknown"]
const genderOptions = ["Male", "Female", "Other"]

const statusStyles = {
  Missing: "bg-red-100 text-red-700 hover:bg-red-100",
  Found: "bg-green-100 text-green-700 hover:bg-green-100",
  Unknown: "bg-gray-100 text-gray-700 hover:bg-gray-100",
}

const FilterDropdown = ({ label, value, options, onChange, onClear }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className={`flex items-center justify-between gap-2 min-w-[130px] ${value ? "border-primary text-primary" : ""}`}
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
    <DropdownMenuContent className="w-40 overflow-y-auto max-h-60">
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

const MissingPersonsTable = () => {
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [status, setStatus] = useState("")
  const [gender, setGender] = useState("")
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  const debounceRef = React.useRef(null)
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }
    
    const { data, isLoading, isError, refetch } = useGetMissingPersonsQuery({
      search: debouncedSearch,
      status,
      gender,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      page,
      limit: 10,
  })

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateMissingPersonStatusMutation()

  const records = data?.data || []
  const pagination = data?.pagination || {}

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )

  const hasFilters = search || selectedDate || status || gender

  const resetFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setSelectedDate(null)
    setStatus("")
    setGender("")
    setPage(1)
  }
  React.useEffect(() => {
  setSelected([])
}, [page])

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
  // Get IDs of current page
  const currentPageIds = records.map((r) => r._id)

  // Check if all rows are selected
  const isAllSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selected.includes(id))

  // Check if partially selected (for indeterminate UI)
  const isSomeSelected = currentPageIds.some((id) => selected.includes(id)) && !isAllSelected

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all current page rows
      setSelected((prev) => prev.filter((id) => !currentPageIds.includes(id)))
    } else {
      // Add all current page rows
      setSelected((prev) => [...new Set([...prev, ...currentPageIds])])
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
           
      await updateStatus({ id, status: newStatus }).unwrap()
      refetch()
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleBulkStatusChange = async (newStatus) => {
    try {
      if (!selected.length) return

      // optimistic UI (optional but recommended)
      const idsToUpdate = [...selected]

      await Promise.all(
        idsToUpdate.map((id) =>
          updateStatus({ id, status: newStatus }).unwrap()
        )
      )

      setSelected([]) // clear selection after update
      refetch()
    } catch (err) {
      console.error("Bulk status update failed:", err)
    }
  }
  console.log("selectedId:", selectedId)
  return (
    <>
    
    <div className="w-full p-8 ">
      <Card>
        {/* FILTER BAR */}
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-1/2">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or last seen location..."
                className="pl-10"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center w-full gap-2 lg:w-1/2">
              {/* Date filter — last seen date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center justify-between gap-2 min-w-[140px] ${selectedDate ? "border-primary text-primary" : ""}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      <span className="text-sm truncate">
                        {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Last Seen Date"}
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
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setPage(1); }}
                  />
                </PopoverContent>
              </Popover>

              <FilterDropdown
                label="Status"
                value={status}
                options={statusOptions}
                onChange={(v) => { setStatus(v); setPage(1); }}
                onClear={() => { setStatus(""); setPage(1); }}
              />

              <FilterDropdown
                label="Gender"
                value={gender}
                options={genderOptions}
                onChange={(v) => { setGender(v); setPage(1); }}
                onClear={() => { setGender(""); setPage(1); }}
              />

              {hasFilters && (
                <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={resetFilters}>
                  Reset
                </Button>
              )}
              {selected.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="ml-2">
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

        {/* TABLE */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected
                      }}
                    />
                  </th>
                  <th className="p-3 text-sm font-medium text-left">Person</th>
                  <th className="p-3 text-sm font-medium text-left">Age</th>
                  <th className="p-3 text-sm font-medium text-left">Gender</th>
                  <th className="p-3 text-sm font-medium text-left">Last Seen</th>
                  <th className="p-3 text-sm font-medium text-left">Location</th>
                  <th className="p-3 text-sm font-medium text-left">Reported By</th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><ThumbsUp className="size-3" /> Likes</div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><ThumbsDown className="size-3" /> Dislikes</div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">
                    <div className="flex items-center gap-1"><MessageCircle className="size-3" /> Comments</div>
                  </th>
                  <th className="p-3 text-sm font-medium text-left">Status</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      {[...Array(12)].map((_, j) => (
                        <td key={j} className="p-3"><Skeleton className="w-full h-4" /></td>
                      ))}
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-sm text-center text-muted-foreground">
                      Failed to load missing persons
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-sm text-center text-muted-foreground">
                      No records found
                    </td>
                  </tr>
                ) : (
                  records.map((item) => (
                    <tr
                      onClick={() => setSelectedId(item._id)}
                      key={item._id}
                      className="transition-colors border-b cursor-pointer hover:bg-muted/50"
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(item._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelected((prev) => [...prev, item._id])
                            } else {
                              setSelected((prev) => prev.filter((id) => id !== item._id))
                            }
                          }}
                        />
                      </td>

                      {/* Person — photo + name */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 shrink-0">
                            {item.photo && <AvatarImage src={item.photo} alt={item.name} />}
                            <AvatarFallback className="text-xs">
                              {getInitials(item.name)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">{item.name}</p>
                        </div>
                      </td>

                      <td className="p-3 text-sm">{item.age}</td>
                      <td className="p-3 text-sm">{item.gender}</td>

                      {/* Last seen date + time */}
                      <td className="p-3 text-sm">
                        {item.lastSeenDate
                          ? format(new Date(item.lastSeenDate), "MMM d, yyyy")
                          : "—"}
                        <br />
                        <span className="text-xs text-muted-foreground">{item.lastSeenTime}</span>
                      </td>

                      {/* Location truncated */}
                      <td className="p-3 text-sm max-w-[140px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 shrink-0 text-muted-foreground" />
                          <span
                            className="truncate max-w-[110px] cursor-default"
                            title={item.lastSeenLocation}
                          >
                            {item.lastSeenLocation}
                          </span>
                        </div>
                      </td>

                      {/* Reported by */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6 shrink-0">
                            {item.reportedBy.profilePicture && (
                              <AvatarImage src={item.reportedBy.profilePicture} />
                            )}
                            <AvatarFallback className="text-xs">
                              {getInitials(item.reportedBy.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{item.reportedBy.name}</p>
                            <p className="text-xs truncate text-muted-foreground">{item.reportedBy.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-sm font-medium text-green-600">{item.upvotes}</td>
                      <td className="p-3 text-sm font-medium text-red-500">{item.downvotes}</td>
                      <td className="p-3 text-sm text-muted-foreground">{item.comments}</td>

                      <td className="p-3">
                        <Badge className={`text-xs ${statusStyles[item.status]}`}>
                          {item.status}
                        </Badge>
                      </td>

                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Found")}>Mark as Found</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Unknown")}>Mark as Unknown</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, "Missing")} className="text-destructive">Mark as Missing</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 px-4 py-4 border-t sm:flex-row">
              <p className="text-sm text-muted-foreground shrink-0">
                Showing{" "}
                <span className="font-medium text-foreground">{((page - 1) * 10) + 1}</span>
                –
                <span className="font-medium text-foreground">{Math.min(page * 10, pagination.total)}</span>
                {" "}of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span> records
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
                    <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="text-xs size-8" onClick={() => setPage(p)}>
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
    </div>
    <MissingPersonModal
      selectedId={selectedId}
      onClose={() => setSelectedId(null)}
    />
   
   </>
  )
}

export default MissingPersonsTable