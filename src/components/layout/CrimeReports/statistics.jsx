"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCrimeStatsQuery } from "@/lib/redux/api/dashboardApi";

export default function Statistic() {
  const { data, isLoading } = useGetCrimeStatsQuery();

  const stats = [
    {
      title: "Total Reports",
      value: data?.totalReports || 0,
      icon: FileText,
      badge: "All time",
      color: "bg-blue-500/10",
    },
    {
      title: "Reports Today",
      value: data?.todayReports || 0,
      icon: CalendarDays,
      badge: "Last 24h",
      color: "bg-purple-500/10",
    },
    {
      title: "Under Investigation",
      value: data?.underInvestigation || 0,
      icon: AlertCircle,
      badge: "Active cases",
      color: "bg-yellow-500/10",
    },
    {
      title: "Resolved Cases",
      value: data?.resolvedCases || 0,
      icon: CheckCircle2,
      badge: "Completed",
      color: "bg-green-500/10",
    },
  ];

  return (
    <div className="py-4">
      <div className="w-full px-4 mx-auto max-w-7xl">
        <Card className="p-0 shadow-sm">
          <CardContent className="flex flex-wrap">
            {stats.map((item, index) => (
              <div
                key={index}
                className="w-full mt-5 md:w-1/2 lg:w-1/4 border-border md:border-r last:border-r-0"
              >
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {item.title}
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {isLoading ? "..." : item.value}
                    </p>

                    <Badge
                      className={cn(
                        "mt-2 text-xs font-normal text-muted-foreground",
                        item.color
                      )}
                    >
                      {item.badge}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-full bg-muted">
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}