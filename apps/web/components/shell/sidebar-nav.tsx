"use client"

import { currentUser } from "@/lib/mock/assistant"
import { navigation } from "@/lib/navigation"
import { Avatar, cn } from "@assistpro/ui"
import { HelpCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoMark } from "../brand/logo"
import { useRouter } from "next/navigation"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5">
        <LogoMark />
        <span className="text-lg font-bold tracking-tight text-foreground" onClick={() => router.push("/dashboard")}>assist</span>
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <Link
          href="/ajuda"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-secondary"
        >
          <HelpCircle className="size-4.5 shrink-0" aria-hidden="true" />
          Ajuda
        </Link>

        <Link
          href="/configuracoes"
          onClick={onNavigate}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
        >
          <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="sm" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">Ver perfil</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
