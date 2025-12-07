import { requireAdmin } from "@/lib/auth/admin-guard";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/admin/dynamic-breadcrumb";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
   await requireAdmin();
   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset >
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
               <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                     orientation="vertical"
                     className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <DynamicBreadcrumb />
               </div>
            </header>
            <main>
               {children}
            </main>
         </SidebarInset>
      </SidebarProvider>
   );
}
export default AdminLayout;
