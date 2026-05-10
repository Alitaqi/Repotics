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

import Logo from "./../../src/assets/Logo.svg";

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
import { useNavigate } from "react-router-dom";





export function AppSidebar({ ...props }) {

  const currentUser = useSelector((state) => state.auth.user);
  const { data: meData, isFetching: meLoading } = useGetMeQuery();
  const user = currentUser || meData?.user || null;
  
  const navigate = useNavigate();
  const handleLogoClick = () => {
    navigate('/feed');
  };
  
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
  <Sidebar
    variant="sidebar"
    collapsible="offcanvas"
    className="bg-white border-r"
    {...props}
  >
    {/* HEADER / BRAND */}
    <SidebarHeader>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl ">
          <img src={Logo} alt="Reportics Logo" className="w-8 h-8 hover:cursor-pointer" onClick={handleLogoClick} />
        </div>

        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-gray-900">
            Reportics
          </p>
          <p className="text-[11px] text-gray-500">
            Crime Intelligence System
          </p>
        </div>
      </div>
    </SidebarHeader>

    <SidebarContent>
      {/* NAV */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Menu
        </SidebarGroupLabel>

        <SidebarMenu className="mt-2 space-y-1">
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className="
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm font-medium text-gray-600
                    hover:bg-[#1B4FCE]/5 hover:text-[#1B4FCE]
                    transition
                  "
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    {/* FOOTER */}
    <SidebarFooter className="p-3">
      <div className="p-2 rounded-xl bg-gray-50">
        <NavUser
          user={{
            name: user?.name,
            email: user?.email,
            username: user?.username,
            avatar: user?.profilePicture || "/avatars/shadcn.jpg",
          }}
        />
      </div>
    </SidebarFooter>
  </Sidebar>
)
}