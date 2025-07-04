"use client"

import { AdminSidebar as SharedAdminSidebar } from "@/components/shared-ui/organisms/admin-sidebar"
import { marketplaceSidebarConfig } from "@/config/sidebar"

export function AdminSidebar() {
  return <SharedAdminSidebar config={marketplaceSidebarConfig} />
}