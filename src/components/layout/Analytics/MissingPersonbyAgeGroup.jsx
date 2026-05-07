"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

import { useGetMissingPersonsByAgeGroupQuery } from "@/lib/redux/api/dashboardApi"

const chartConfig = {
  count: { label: "Missing" },
  "0-12": { label: "Children", color: "var(--chart-1)" },
  "13-18": { label: "Teen", color: "var(--chart-2)" },
  "19-30": { label: "Young Adult", color: "var(--chart-3)" },
  "31-50": { label: "Adult", color: "var(--chart-4)" },
  "51+": { label: "Senior", color: "var(--chart-5)" },
}

export default function MissingPersonbyAgeGroup() {

  const { data, isLoading, isError } =
    useGetMissingPersonsByAgeGroupQuery()

  const chartData =
    data?.data?.map((item) => ({
      ageGroup: item.ageGroup,
      count: item.count,
      fill: `var(--color-${item.ageGroup})`,
    })) || []

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading chart</div>

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Missing Persons by Age Group</CardTitle>
        <CardDescription>Currently missing individuals</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="ageGroup"
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="ageGroup" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}