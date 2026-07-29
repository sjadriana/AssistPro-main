"use client"

import { navigation } from "@/lib/navigation"
import { X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarNav } from "./sidebar-nav"
import { Topbar } from "./topbar"

function usePageTitle() {
  const pathname = usePathname()

  if (pathname.startsWith("/atendimentos/novo")) return "Novo atendimento"
  if (pathname === "/clientes/novo") return "Novo cliente"
  if (pathname.startsWith("/clientes/") && pathname !== "/clientes") return "Cliente"
  if (pathname.startsWith("/ajuda")) return "Ajuda"

  const match = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

  return match?.label ?? "Dashboard"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = usePageTitle()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!sidebarOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSidebarOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="relative h-full w-72 max-w-[85%] border-r border-sidebar-border shadow-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Fechar menu</span>
            </button>
            <SidebarNav onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  )
}
