"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

import { useGetTopCrimeTypesLast30DaysQuery } from "@/lib/redux/api/dashboardApi"

const chartConfig = {
  count: {
    label: "Reports",
    color: "var(--chart-1)",
  },
}

export default function CrimeTypeDistribution() {
  const { data, isLoading, isError } = useGetTopCrimeTypesLast30DaysQuery()

  const chartData =
    data?.data?.map((item) => ({
      crimeType: item.crimeType,
      count: item.count,
    })) || []

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading chart</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Crime Categories</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="crimeType"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar
              dataKey="count"
              // fill="#4f46e5"
              fill="#4f45e5"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Top reported crimes in last 30 days
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on user submitted reports
        </div>
      </CardFooter>
    </Card>
  )
}