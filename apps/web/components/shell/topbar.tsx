"use client"

import { navigation } from "@/lib/navigation"
import { assistantEvents } from "@/lib/mock/assistant"
import { customers } from "@/lib/mock/customers"
import { appointments } from "@/lib/mock/appointments"
import { Bell, Menu, Plus, Search, X, CheckCircle, XCircle, AlertCircle, Clock, UserMinus, CalendarPlus, UserPlus, Receipt, CheckSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { AssistantEvent } from "@assistpro/types"

const newActions = [
  { label: "Novo agendamento", href: "/atendimentos/novo", icon: CalendarPlus },
  { label: "Novo cliente", href: "/clientes/novo", icon: UserPlus },
  { label: "Nova cobrança", href: "/financeiro", icon: Receipt },
  { label: "Nova tarefa", href: "/comunicacoes", icon: CheckSquare },
] as const

// ─── Notificações ───────────────────────────────────────────────────────────

const eventIconMap: Partial<Record<AssistantEvent["kind"], React.ElementType>> = {
  CONFIRMACAO_RECEBIDA: CheckCircle,
  CANCELAMENTO: XCircle,
  PAGAMENTO_PENDENTE: AlertCircle,
  REAGENDAMENTO_SOLICITADO: Clock,
  CLIENTE_INATIVO: UserMinus,
  RETORNO_SUGERIDO: Clock,
}

const eventColorMap: Partial<Record<AssistantEvent["kind"], string>> = {
  CONFIRMACAO_RECEBIDA: "text-success-strong",
  CANCELAMENTO: "text-danger",
  PAGAMENTO_PENDENTE: "text-warning-strong",
  REAGENDAMENTO_SOLICITADO: "text-primary",
  CLIENTE_INATIVO: "text-muted-foreground",
  RETORNO_SUGERIDO: "text-primary",
}

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notificações"
      className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Notificações</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Fechar notificações"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
        {assistantEvents.map((event) => {
          const Icon = eventIconMap[event.kind] ?? Bell
          const color = eventColorMap[event.kind] ?? "text-muted-foreground"

          return (
            <li key={event.id} className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50">
              <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden="true" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm leading-snug text-foreground">{event.message}</p>
                {event.detail ? (
                  <p className="text-xs text-muted-foreground">{event.detail}</p>
                ) : null}
                {event.suggestedAction ? (
                  <Link
                    href={event.suggestedAction.href}
                    onClick={onClose}
                    className="mt-1 w-fit rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {event.suggestedAction.label}
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="text-xs font-medium text-primary hover:underline"
        >
          Ver todas as atividades
        </Link>
      </div>
    </div>
  )
}

// ─── Busca ───────────────────────────────────────────────────────────────────

type SearchResult = { label: string; href: string; sub: string }

function buildResults(query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: SearchResult[] = []

  // Clientes
  for (const c of customers) {
    if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) {
      results.push({ label: c.name, href: `/clientes/${c.id}`, sub: c.phone })
    }
  }

  // Páginas
  for (const item of navigation) {
    if (item.label.toLowerCase().includes(q)) {
      results.push({ label: item.label, href: item.href, sub: "Página" })
    }
  }

  // Atendimentos
  for (const apt of appointments) {
    const svc = apt.serviceName ?? apt.serviceId
    if (svc.toLowerCase().includes(q) || apt.customerName.toLowerCase().includes(q)) {
      results.push({
        label: apt.customerName,
        href: `/agenda`,
        sub: `${svc} · ${apt.startsAt.slice(0, 10)}`,
      })
    }
  }

  return results.slice(0, 8)
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const results = buildResults(query)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Buscar">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* painel — z-10 garante que fica acima do backdrop */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-lg px-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar clientes, atendimentos, páginas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Fechar busca"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* resultados */}
          {results.length > 0 ? (
            <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {results.map((result, i) => (
                <li key={i}>
                  <Link
                    href={result.href}
                    onClick={onClose}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-secondary/60"
                  >
                    <span className="text-sm font-medium text-foreground">{result.label}</span>
                    <span className="text-xs text-muted-foreground">{result.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="flex flex-col gap-1 px-4 py-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Atalhos rápidos</p>
              {navigation.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Topbar ──────────────────────────────────────────────────────────────────

export function Topbar({
  title,
  onOpenSidebar,
}: {
  title: string
  onOpenSidebar: () => void
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const newMenuRef = useRef<HTMLDivElement>(null)
  const unreadCount = assistantEvents.length

  useEffect(() => {
    if (!newMenuOpen) return
    function onClick(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) setNewMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNewMenuOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [newMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="-ml-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Abrir menu</span>
        </button>

        <h1 className="flex-1 truncate text-lg font-semibold text-foreground">{title}</h1>

        <button
          type="button"
          onClick={() => {
            setNotificationsOpen(false)
            setSearchOpen(true)
          }}
          className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Buscar"
        >
          <Search className="size-4.5" aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
            aria-label={`Notificações — ${unreadCount} não lidas`}
            aria-expanded={notificationsOpen}
          >
            <Bell className="size-4.5" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />
          ) : null}
        </div>

        <div ref={newMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(false)
              setNewMenuOpen((prev) => !prev)
            }}
            aria-expanded={newMenuOpen}
            aria-haspopup="true"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo
          </button>

          {newMenuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            >
              <p className="px-4 pt-3.5 pb-1.5 text-xs font-medium text-muted-foreground">
                O que você deseja criar?
              </p>
              <ul className="pb-2">
                {newActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <li key={action.href}>
                      <Link
                        href={action.href}
                        role="menuitem"
                        onClick={() => setNewMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {action.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </header>

      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
    </>
  )
}
