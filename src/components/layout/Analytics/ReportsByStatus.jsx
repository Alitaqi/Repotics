"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

import { useGetMissingPersonsByStatusQuery }
  from "@/lib/redux/api/dashboardApi"

const chartConfig = {
  count: { label: "Reports" },

  Missing: {
    label: "Missing",
    color: "orange",
  },
  Found: {
    label: "Found",
    color: "var(--chart-2)",
  },
  Unknown: {
    label: "Unknown",
    color: "var(--chart-3)",
  },
}

export default function ReportsByStatus() {

  const { data, isLoading, isError } =
    useGetMissingPersonsByStatusQuery()

  const chartData =
    data?.data?.map(item => ({
      status: item.status,
      count: item.count,
      fill: `var(--color-${item.status})`
    })) || []

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading chart</div>

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Missing Persons by Status</CardTitle>
        <CardDescription>Current case distribution</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Case status distribution
          <TrendingUp className="w-4 h-4" />
        </div>

        <div className="leading-none text-muted-foreground">
          Missing vs Found vs Unknown
        </div>
      </CardFooter>
    </Card>
  )
}