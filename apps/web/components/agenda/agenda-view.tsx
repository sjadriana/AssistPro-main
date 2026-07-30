"use client"

import { SendWhatsAppDialog, type WhatsAppTarget } from "@/components/messaging/send-whatsapp-dialog"
import { addMessage } from "@/lib/message-store"
import { blockedSlots as initialBlockedSlots } from "@/lib/mock/blocked-slots"
import type { CreateBlockedSlotInput } from "@assistpro/types"
import { cn } from "@assistpro/ui"
import { Ban, CalendarClock, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { BlockScheduleDialog } from "./block-schedule-dialog"
import { DayList } from "./day-list"
import { FreeSlotsDialog } from "./free-slots-dialog"
import { MonthGrid } from "./month-grid"
import { WeekGrid } from "./week-grid"

const views = [
  { id: "dia", label: "Dia" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
] as const

type ViewId = (typeof views)[number]["id"]

/** Retorna YYYY-MM-DD de hoje no fuso local do browser. */
function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Avança uma data YYYY-MM-DD por `days` dias. */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number)
  const result = new Date(Date.UTC(y, m - 1, d + days))
  return result.toISOString().slice(0, 10)
}

/** Segunda-feira da semana que contém `date`. */
function weekStart(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const offset = (dt.getUTCDay() + 6) % 7
  return addDays(date, -offset)
}

/** Rótulo da semana: "28 Jul – 03 Ago, 2025". */
function weekLabel(start: string): string {
  const [y, m, d] = start.split("-").map(Number)
  const startDate = new Date(Date.UTC(y, m - 1, d))
  const endDate = new Date(Date.UTC(y, m - 1, d + 6))
  const startStr = startDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" })
  const endStr = endDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  return `${startStr} – ${endStr}`
}

/** Rótulo do mês: "Julho de 2025". */
function monthLabel(date: string): string {
  const [y, m] = date.split("-").map(Number)
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Rótulo do dia: "Terça, 28 de julho de 2025". */
function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number)
  const label = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function AgendaView() {
  const today = localToday()

  const [view, setView] = useState<ViewId>("dia")
  /** Cursor: para "dia" é YYYY-MM-DD; para "semana" é a segunda-feira; para "mês" é YYYY-MM-01. */
  const [cursor, setCursor] = useState(today)

  const [slotsOpen, setSlotsOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockedSlots, setBlockedSlots] = useState(initialBlockedSlots)
  const [whatsappTarget, setWhatsappTarget] = useState<WhatsAppTarget | null>(null)

  function handleBlock(input: CreateBlockedSlotInput) {
    const now = new Date().toISOString()
    setBlockedSlots((prev) => [
      ...prev,
      {
        id: `blk-${Math.random().toString(36).slice(2, 8)}`,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        allDay: input.allDay,
        reason: input.reason ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ])
  }

  function goToday() {
    if (view === "dia") setCursor(today)
    else if (view === "semana") setCursor(weekStart(today))
    else setCursor(`${today.slice(0, 7)}-01`)
  }

  function goBack() {
    if (view === "dia") setCursor(addDays(cursor, -1))
    else if (view === "semana") setCursor(addDays(cursor, -7))
    else {
      const [y, m] = cursor.split("-").map(Number)
      const prev = new Date(Date.UTC(y, m - 2, 1))
      setCursor(`${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}-01`)
    }
  }

  function goForward() {
    if (view === "dia") setCursor(addDays(cursor, 1))
    else if (view === "semana") setCursor(addDays(cursor, 7))
    else {
      const [y, m] = cursor.split("-").map(Number)
      const next = new Date(Date.UTC(y, m, 1))
      setCursor(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`)
    }
  }

  function handleViewChange(next: ViewId) {
    setView(next)
    // Ao trocar de view, adapta o cursor para o novo formato.
    if (next === "dia") setCursor(today)
    else if (next === "semana") setCursor(weekStart(today))
    else setCursor(`${today.slice(0, 7)}-01`)
  }

  const rangeLabel = useMemo(() => {
    if (view === "dia") return dayLabel(cursor)
    if (view === "semana") return weekLabel(cursor)
    return monthLabel(cursor)
  }, [view, cursor])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Hoje */}
        <button
          type="button"
          onClick={goToday}
          className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
        >
          Hoje
        </button>

        {/* Anterior / Próximo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary active:scale-95"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
            <span className="sr-only">Período anterior</span>
          </button>
          <button
            type="button"
            onClick={goForward}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary active:scale-95"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
            <span className="sr-only">Próximo período</span>
          </button>
        </div>

        {/* Rótulo do período atual */}
        <p className="text-sm font-semibold text-foreground">{rangeLabel}</p>

        {/* Ações à direita */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBlockOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <Ban className="size-4" aria-hidden="true" />
            Bloquear
          </button>

          <button
            type="button"
            onClick={() => setSlotsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-success-soft px-3.5 py-2 text-sm font-semibold text-success-strong transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            Enviar horários livres
          </button>
        </div>

        {/* Seletor de view */}
        <div
          role="tablist"
          aria-label="Visualização da agenda"
          className="flex items-center gap-1 rounded-xl border border-border bg-card p-1"
        >
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => handleViewChange(item.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                view === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {view === "dia" ? <DayList date={cursor} /> : null}
      {view === "semana" ? <WeekGrid weekStart={cursor} today={today} /> : null}
      {view === "mes" ? <MonthGrid monthStart={cursor} today={today} /> : null}

      <Link
        href="/atendimentos/novo"
        className="fixed right-5 bottom-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
      >
        <Plus className="size-6" aria-hidden="true" />
        <span className="sr-only">Novo atendimento</span>
      </Link>

      <BlockScheduleDialog open={blockOpen} onOpenChange={setBlockOpen} onBlock={handleBlock} />

      <FreeSlotsDialog
        open={slotsOpen}
        onOpenChange={setSlotsOpen}
        onContinue={(target) => {
          setSlotsOpen(false)
          setWhatsappTarget(target)
        }}
      />

      <SendWhatsAppDialog
        target={whatsappTarget}
        onClose={() => setWhatsappTarget(null)}
        onSent={(message) => addMessage(message)}
      />
    </div>
  )
}
