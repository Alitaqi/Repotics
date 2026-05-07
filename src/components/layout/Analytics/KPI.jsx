"use client"

import {
  TrendingUpIcon,
  ShieldAlertIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

import StatisticsWithStatus from "@/components/statistics-with-status"
import { useGetDashboardKPIsQuery } from "@/lib/redux/api/dashboardApi"

const iconMap = {
  "Crime Growth Rate": <TrendingUpIcon />,
  "AI Processing Rate": <ShieldAlertIcon />,
  "Top Crime City": <MapPinIcon />,
  "Missing Resolution Rate": <UsersIcon />,
}

const KPI = () => {
  const { data, isLoading, isError } = useGetDashboardKPIsQuery()

  if (isLoading) {
    return (
      <div className="px-4 py-2 mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to load KPI data
      </div>
    )
  }

  const statisticsData =
    data?.data?.map((item) => ({
      ...item,
      icon: iconMap[item.title] || <ShieldAlertIcon />,
    })) || []

  return (
    <div className="py-1 sm:py-2 lg:py-2">
      <div className="grid gap-4 px-4 mx-auto max-w-7xl sm:grid-cols-2 sm:px-6 lg:px-8 xl:grid-cols-4">
        {statisticsData.map((card, index) => (
          <StatisticsWithStatus key={index} {...card} />
        ))}
      </div>
    </div>
  )
}

export default KPI