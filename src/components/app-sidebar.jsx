import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserRound,
  Clipboard,
  ChartNoAxesCombined,
  ScanEye
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useGetMeQuery } from "@/lib/redux/api/authApi";
import { useSelector } from "react-redux";



export function AppSidebar({ ...props }) {

  const currentUser = useSelector((state) => state.auth.user);
  const { data: meData, isFetching: meLoading } = useGetMeQuery();
  const user = currentUser || meData?.user || null;
  
  const data = {
  navMain: [
    { title: "Analytics", url: "/dashboard", icon: ChartNoAxesCombined },
    { title: "Crime Reports", url: "/dashboard/crime-reports", icon: Clipboard },
    { title: "Missing Person", url: "/dashboard/missing-persons", icon: ScanEye },
    { title: "Feed", url: "/feed", icon: BookOpen },
    { title: "Profile", url: `/profile/${user?.username}`, icon: UserRound },
    { title: "Heatmap", url: "/heatmap", icon: Map },
    { title: "Settings", url: "/settings", icon: Settings2 },
  ],
}
  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" {...props}>
      {/* Simple logo/brand header instead of TeamSwitcher */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <GalleryVerticalEnd className="w-5 h-5" />
          <span className="text-sm font-semibold">Repotics</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav — flat, no dropdowns */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="mr-10">
        <NavUser user={{
      name: user?.name,
      email: user?.email,
      username: user?.username,
      avatar: user?.profilePicture || "/avatars/shadcn.jpg",
    }} />
      </SidebarFooter>
    </Sidebar>
  )
}