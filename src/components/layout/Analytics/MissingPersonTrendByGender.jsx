"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

import { useGetMissingPersonsByGenderTrendQuery }
  from "@/lib/redux/api/dashboardApi"

const chartConfig = {
  Male: {
    label: "Male",
    color: "var(--chart-1)",
  },
  Female: {
    label: "Female",
    color: "var(--chart-2)",
  },
  Other: {
    label: "Other",
    color: "var(--chart-3)",
  },
}

export default function MissingPersonTrendByGender() {

  const { data, isLoading, isError } =
    useGetMissingPersonsByGenderTrendQuery()

  const chartData = data?.data || []

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading chart</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Missing Persons by Gender</CardTitle>
        <CardDescription>Last 6 months trend</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-52">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Line
              dataKey="Male"
              type="monotone"
              stroke="var(--color-Male)"
              strokeWidth={2}
              dot={false}
            />

            <Line
              dataKey="Female"
              type="monotone"
              stroke="var(--color-Female)"
              strokeWidth={2}
              dot={false}
            />

            <Line
              dataKey="Other"
              type="monotone"
              stroke="var(--color-Other)"
              strokeWidth={2}
              dot={false}
            />

          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex items-start w-full gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Gender distribution trend
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Missing persons reported in last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}