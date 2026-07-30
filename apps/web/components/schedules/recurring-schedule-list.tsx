"use client"

import { RecurringScheduleForm } from "@/components/schedules/recurring-schedule-form"
import {
  addRecurringSchedule,
  deleteRecurringSchedule,
  recurringSchedules as initialSchedules,
  updateRecurringSchedule,
} from "@/lib/mock/recurring-schedules"
import type { RecurringSchedule } from "@assistpro/types"
import { cn } from "@assistpro/ui"
import { Check, Clock, Copy, Pencil, Plus, Trash2, Users } from "lucide-react"
import { useState } from "react"

const weekdayShort: Record<string, string> = {
  SEG: "Seg", TER: "Ter", QUA: "Qua",
  QUI: "Qui", SEX: "Sex", SAB: "Sáb", DOM: "Dom",
}

type Mode = "list" | "new" | { editing: RecurringSchedule }

export function RecurringScheduleList() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>(initialSchedules)
  const [mode, setMode] = useState<Mode>("list")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleCopyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/agendar/${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleSave(data: Omit<RecurringSchedule, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString()
    if (mode === "new") {
      const next: RecurringSchedule = {
        ...data,
        id: `rs-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      addRecurringSchedule(next)
      setSchedules((prev) => [...prev, next])
    } else if (typeof mode === "object") {
      const updated = { ...mode.editing, ...data, updatedAt: now }
      updateRecurringSchedule(mode.editing.id, data)
      setSchedules((prev) => prev.map((s) => (s.id === mode.editing.id ? updated : s)))
    }
    setMode("list")
  }

  function handleDelete(id: string) {
    deleteRecurringSchedule(id)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  function handleToggleActive(rs: RecurringSchedule) {
    const patch = { active: !rs.active }
    updateRecurringSchedule(rs.id, patch)
    setSchedules((prev) => prev.map((s) => (s.id === rs.id ? { ...s, ...patch } : s)))
  }

  if (mode === "new" || typeof mode === "object") {
    return (
      <RecurringScheduleForm
        initial={typeof mode === "object" ? mode.editing : undefined}
        onSave={handleSave}
        onCancel={() => setMode("list")}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/40 py-10 text-center">
          <Clock className="size-8 text-muted-foreground/50" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">Nenhuma grade criada</p>
            <p className="text-xs text-muted-foreground">
              Crie uma grade recorrente para que os alunos possam se inscrever.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {schedules.map((rs) => (
            <li
              key={rs.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-opacity",
                !rs.active && "opacity-50",
              )}
            >
              {/* Cabeçalho: nome do serviço + ações */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">{rs.serviceName}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" aria-hidden="true" />
                    {rs.startTime} – {rs.endTime}
                    <span className="mx-1 text-border">·</span>
                    <Users className="size-3" aria-hidden="true" />
                    {rs.maxParticipants} vagas
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rs)}
                    aria-label={rs.active ? "Desativar grade" : "Ativar grade"}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                      rs.active
                        ? "bg-success-soft text-success-strong"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {rs.active ? "Ativa" : "Pausada"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode({ editing: rs })}
                    aria-label="Editar grade"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rs.id)}
                    aria-label="Excluir grade"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger-strong"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Chips dos dias */}
              <div className="flex flex-wrap gap-1.5">
                {rs.weekdays.map((d) => (
                  <span
                    key={d}
                    className="rounded-lg bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-accent-foreground"
                  >
                    {weekdayShort[d]}
                  </span>
                ))}
              </div>

              {/* Link da vitrine */}
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  /agendar/{rs.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(rs.id)}
                  aria-label="Copiar link da vitrine"
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all",
                    copiedId === rs.id
                      ? "bg-success-soft text-success-strong"
                      : "text-primary hover:opacity-70",
                  )}
                >
                  {copiedId === rs.id ? (
                    <><Check className="size-3" aria-hidden="true" /> Copiado!</>
                  ) : (
                    <><Copy className="size-3" aria-hidden="true" /> Copiar link</>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setMode("new")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Nova grade recorrente
      </button>
    </div>
  )
}
