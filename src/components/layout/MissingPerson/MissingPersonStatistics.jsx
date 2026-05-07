"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMissingPersonStatsQuery } from "@/lib/redux/api/dashboardApi";

export default function MissingPersonStatistics() {
  const { data, isLoading } = useGetMissingPersonStatsQuery();

  const stats = [
    {
      title: "Total Missing",
      value: data?.data?.totalMissing || 0,
      icon: Users,
      badge: "All records",
      color: "bg-blue-500/10",
    },
    {
      title: "Found Persons",
      value: data?.data?.foundPersons || 0,
      icon: CheckCircle2,
      badge: "Recovered",
      color: "bg-green-500/10",
    },
    {
      title: "Reported Today",
      value: data?.data?.reportedToday || 0,
      icon: CalendarDays,
      badge: "Last 24h",
      color: "bg-purple-500/10",
    },
    {
      title: "Active Cases",
      value: data?.data?.activeCases || 0,
      icon: AlertTriangle,
      badge: "Still missing",
      color: "bg-yellow-500/10",
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