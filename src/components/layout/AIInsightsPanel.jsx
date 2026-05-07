import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetPatrolInsightsQuery } from "@/lib/redux/api/heatmapApi"
import {
  Brain, Shield, Clock, MapPin, AlertTriangle,
  TrendingUp, X, ChevronDown, ChevronUp
} from "lucide-react"

const riskColors = {
  LOW: "bg-green-500/20 text-green-300 border-green-400/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-400/30",
  CRITICAL: "bg-red-500/20 text-red-300 border-red-400/30",
}

export default function AIInsightsPanel({ onClose }) {
  const [expanded, setExpanded] = useState({
    threats: true,
    patrol: true,
    patterns: true,
  })

  const { data, isLoading, isError, refetch } = useGetPatrolInsightsQuery()
  const insights = data?.insights
  const stats = data?.rawStats

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="flex flex-col h-full text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
            <Brain className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Patrol Insights</h2>
            <p className="text-xs text-white/50">Crime Intelligence Briefing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-white/60 hover:text-white hover:bg-white/10"
            onClick={refetch}
          >
            Refresh
          </Button>
          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">

        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div className="w-3 h-3 border-b border-indigo-400 rounded-full animate-spin" />
              Analyzing crime data...
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-12 bg-white/10" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="text-red-400 size-8" />
            <p className="text-sm text-white/60">Failed to generate insights</p>
            <Button size="sm" onClick={refetch} className="bg-indigo-600 hover:bg-indigo-700">Retry</Button>
          </div>
        ) : insights ? (
          <>
            {/* Risk Level + Summary */}
            <div className="p-4 border rounded-xl bg-white/5 border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wide uppercase text-white/50">Current Risk Level</span>
                <Badge className={`text-xs border ${riskColors[insights.riskLevel] || riskColors.MEDIUM}`}>
                  {insights.riskLevel}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-white/80">{insights.situationSummary}</p>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 text-center border rounded-xl bg-white/5 border-white/10">
                  <p className="text-2xl font-bold text-indigo-300">{stats.totalCrimes}</p>
                  <p className="text-xs text-white/40">Total Reports</p>
                </div>
                <div className="p-3 text-center border rounded-xl bg-white/5 border-white/10">
                  <p className="text-2xl font-bold text-blue-300">{stats.topLocations?.length || 0}</p>
                  <p className="text-xs text-white/40">Active Zones</p>
                </div>
              </div>
            )}

            {/* Top Threats */}
            <div className="border rounded-xl border-white/10 bg-white/5">
              <button
                className="flex items-center justify-between w-full px-4 py-3"
                onClick={() => toggle("threats")}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-red-300">
                  <AlertTriangle className="size-3.5" /> Top Threat Areas
                </div>
                {expanded.threats ? <ChevronUp className="size-3.5 text-white/40" /> : <ChevronDown className="size-3.5 text-white/40" />}
              </button>
              {expanded.threats && (
                <div className="px-4 pb-4 space-y-3">
                  {insights.topThreats?.map((threat, i) => (
                    <div key={i} className="p-3 border rounded-lg bg-red-500/5 border-red-400/10">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="text-red-400 size-3" />
                        <span className="text-xs font-medium text-white/90">{threat.area}</span>
                        <Badge className="text-xs text-red-300 bg-red-500/10 border-red-400/20">{threat.crimeType}</Badge>
                      </div>
                      <p className="text-xs text-white/50">{threat.reasoning}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patrol Recommendations */}
            <div className="border rounded-xl border-white/10 bg-white/5">
              <button
                className="flex items-center justify-between w-full px-4 py-3"
                onClick={() => toggle("patrol")}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                  <Shield className="size-3.5" /> Patrol Recommendations
                </div>
                {expanded.patrol ? <ChevronUp className="size-3.5 text-white/40" /> : <ChevronDown className="size-3.5 text-white/40" />}
              </button>
              {expanded.patrol && (
                <div className="px-4 pb-4 space-y-3">
                  {insights.patrolRecommendations?.map((rec, i) => (
                    <div key={i} className="p-3 border rounded-lg bg-blue-500/5 border-blue-400/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="text-blue-400 size-3" />
                        <span className="text-xs font-medium text-white/90">{rec.timing}</span>
                        <span className="text-xs text-white/50">— {rec.area}</span>
                      </div>
                      <p className="text-xs text-white/50">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pattern Insights */}
            <div className="border rounded-xl border-white/10 bg-white/5">
              <button
                className="flex items-center justify-between w-full px-4 py-3"
                onClick={() => toggle("patterns")}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <TrendingUp className="size-3.5" /> Pattern Insights
                </div>
                {expanded.patterns ? <ChevronUp className="size-3.5 text-white/40" /> : <ChevronDown className="size-3.5 text-white/40" />}
              </button>
              {expanded.patterns && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm leading-relaxed text-white/70">{insights.patternInsights}</p>
                  <div className="p-3 border rounded-lg bg-emerald-500/5 border-emerald-400/10">
                    <p className="mb-1 text-xs font-semibold text-emerald-300">Safety Advisory</p>
                    <p className="text-xs text-white/60">{insights.safetyAdvisory}</p>
                  </div>
                </div>
              )}
            </div>

          </>
        ) : null}
      </div>
    </div>
  )
}