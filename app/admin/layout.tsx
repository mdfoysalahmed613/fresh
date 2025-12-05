
import AppSidebar from '@/components/admin/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { requireAdmin } from '@/lib/auth/admin-guard'
import React, { Suspense } from 'react'

const layout = async ({ children }: { children: React.ReactNode }) => {
   const adminGuard = async () => {
      await requireAdmin()
      return null
   }
   return (
      <>
         <Suspense fallback={null}>
            {adminGuard()}
         </Suspense>
         <SidebarProvider >
            <AppSidebar />
            <SidebarInset>
               <SidebarTrigger />
               {children}
            </SidebarInset>
         </SidebarProvider>
      </>
   )
}

export default layout