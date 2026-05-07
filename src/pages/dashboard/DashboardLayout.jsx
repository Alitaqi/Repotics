import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Outlet, useLocation, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useGetMeQuery } from "@/lib/redux/api/authApi"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const breadcrumbMap = {
  "/dashboard": { parent: "Dashboard", page: "Analytics" },
  "/dashboard/crime-reports": { parent: "Dashboard", page: "Crime Reports" },
  "/dashboard/missing-persons": { parent: "Dashboard", page: "Missing Persons" },
}

export default function DashboardLayout() {
  const currentUser = useSelector((state) => state.auth.user);
  const { data: meData } = useGetMeQuery();
  const user = currentUser || meData?.user || null;
  const location = useLocation();
  const crumb = breadcrumbMap[location.pathname] ?? { parent: "Dashboard", page: "Page" };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex items-center h-16 gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {crumb.parent && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">{crumb.parent}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage>{crumb.page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-col flex-1 gap-4 p-4 pt-0">
          <Outlet />
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}