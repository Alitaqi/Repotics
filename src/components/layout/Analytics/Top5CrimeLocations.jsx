"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useGetTopCrimeCitiesQuery } from "@/lib/redux/api/dashboardApi"

export const description = "Top 5 crime cities"

export default function Top5CrimeLocations() {

  const { data, isLoading, isError } = useGetTopCrimeCitiesQuery()

  const chartData =
    data?.map((item) => ({
      location: item.city,
      count: item.count,
    })) || []

  const chartConfig = {
    count: {
      label: "Reports",
    },
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">Loading chart...</CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          Failed to load crime city data
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Crime Cities</CardTitle>
        <CardDescription>Top 5 cities — last 6 months</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-56">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 10 }}
          >
            <CartesianGrid horizontal={false} />

            <YAxis
              dataKey="location"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={110}
            />

            <XAxis dataKey="count" type="number" hide />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Bar
              dataKey="count"
              fill="var(--chart-1)"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Highest crime concentration cities
          <TrendingUp className="w-4 h-4" />
        </div>

        <div className="leading-none text-muted-foreground">
          Based on reports from last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}