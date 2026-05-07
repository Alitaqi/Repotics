"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCrimeByTimeOfDayQuery } from "@/lib/redux/api/dashboardApi"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

export default function CrimeSpikeOverTime() {
  const { data, isLoading, isError } = useGetCrimeByTimeOfDayQuery()
  const chartData = data?.data || []
  const months = data?.months || []

  const chartConfig = months.reduce((acc, month, i) => {
    acc[month] = { label: month, color: COLORS[i % COLORS.length] }
    return acc
  }, {})

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime by Time of Day</CardTitle>
        <CardDescription>How crime reports are distributed across the day — last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[250px]" />
        ) : isError ? (
          <p className="text-sm text-center text-muted-foreground">Failed to load data</p>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-90">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timeSlot"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {months.map((month, i) => (
                <Line
                  key={month}
                  dataKey={month}
                  type="natural"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Crime activity peaks by time slot <TrendingUp className="w-4 h-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Each line represents one month — last 6 months shown
        </div>
      </CardFooter>
    </Card>
  )
}