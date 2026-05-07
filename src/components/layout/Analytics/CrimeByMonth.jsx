"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useGetCrimeReportsByMonthQuery } from "@/lib/redux/api/dashboardApi"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  count: {
    label: "Crime Reports",
    color: "var(--chart-1)",
  },
}

export default function CrimeByTimeofDay() {
  const { data, isLoading, isError } = useGetCrimeReportsByMonthQuery();
  const chartData = data?.data || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crime Reports by Month</CardTitle>
        <CardDescription>
          Total crime reports submitted over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[100px]" />
        ) : isError ? (
          <p className="text-sm text-center text-muted-foreground">Failed to load data</p>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-70">
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area
                dataKey="count"
                type="natural"
                fill="var(--color-count)"
                fillOpacity={0.4}
                stroke="var(--color-count)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex items-start w-full gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Last 12 months of crime activity <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Grouped by month
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}