"use client"

import { createContext, useContext } from "react"

interface SidebarContextValue {
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openCreate: () => void
}

export const SidebarContext = createContext<SidebarContextValue>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  openCreate: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}
