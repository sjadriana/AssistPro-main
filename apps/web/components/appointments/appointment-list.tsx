"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { appointments as initialAppointments } from "@/lib/mock/appointments"
import { serviceById } from "@/lib/mock/services"
import { consumeSessionForAppointment } from "@/lib/packages"
import { DISPLAY_TIMEZONE, LOCALE } from "@assistpro/config"
import type { Appointment, AppointmentMode, AppointmentStatus } from "@assistpro/types"
import { AppointmentBadge, Avatar, Badge, Card, CardHeader, formatCurrency, formatDayMonth, formatTime, Select } from "@assistpro/ui"
import { Check, CheckCheck, ExternalLink, Plus, Search, Users, X } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const statusFilters = [
  { value: "TODOS", label: "Todos" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "CONCLUIDO", label: "Concluídos" },
  { value: "CANCELADO", label: "Cancelados" },
] as const

const modeLabels: Record<AppointmentMode, string> = {
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
  DOMICILIAR: "Domiciliar",
}

/**
 * Chave de agrupamento no fuso de exibição. Não dá para cortar a string ISO,
 * porque um atendimento às 22h em São Paulo já é o dia seguinte em UTC.
 */
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DISPLAY_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** Nome do dia da semana ("quarta-feira"), exibido ao lado da data. */
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: DISPLAY_TIMEZONE,
  weekday: "long",
})

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"

export function AppointmentList() {
  const [items, setItems] = useState<Appointment[]>(initialAppointments)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<(typeof statusFilters)[number]["value"]>("TODOS")
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null)
  const [extraChargeNotice, setExtraChargeNotice] = useState<{ customerName: string; amount: number } | null>(null)

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    const filtered = items
      .filter((appointment) => {
        const matchesStatus = status === "TODOS" || appointment.status === status
        const matchesQuery =
          normalized.length === 0 ||
          appointment.customerName.toLowerCase().includes(normalized) ||
          appointment.serviceName.toLowerCase().includes(normalized)

        return matchesStatus && matchesQuery
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

    const byDay = new Map<string, Appointment[]>()

    for (const appointment of filtered) {
      const key = dayKeyFormatter.format(new Date(appointment.startsAt))
      const bucket = byDay.get(key)

      if (bucket) bucket.push(appointment)
      else byDay.set(key, [appointment])
    }

    return [...byDay.entries()].map(([key, dayItems]) => ({ key, items: dayItems }))
  }, [items, query, status])

  function updateStatus(id: string, next: AppointmentStatus) {
    setItems((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: next, updatedAt: new Date().toISOString() }
          : appointment,
      ),
    )
  }

  function confirmCancel() {
    if (!pendingCancel) return

    updateStatus(pendingCancel.id, "CANCELADO")
    setPendingCancel(null)
  }

  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente ou serviço..."
            aria-label="Buscar atendimento"
            className="w-full rounded-xl border border-input bg-card py-2.5 pr-3.5 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 focus:outline-none"
          />
        </div>

        <Select
          value={status}
          aria-label="Filtrar por status"
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="sm:w-44"
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>

        <Link
          href="/atendimentos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Novo atendimento
        </Link>
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {total === 0 ? "Nenhum atendimento" : total === 1 ? "1 atendimento" : `${total} atendimentos`}
      </p>

      {groups.length === 0 ? (
        <Card>
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum atendimento encontrado para este filtro.
          </p>
        </Card>
      ) : (
        groups.map((group) => {
          const reference = group.items[0].startsAt

          return (
            <Card key={group.key}>
              <CardHeader
                title={
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    {formatDayMonth(reference)}
                    {/* first-letter, e não capitalize: "segunda-feira" viraria "Segunda-Feira". */}
                    <span className="text-xs font-normal text-muted-foreground first-letter:uppercase">
                      {weekdayFormatter.format(new Date(reference))}
                    </span>
                  </span>
                }
              />

              <ul className="flex flex-col">
                {group.items.map((appointment) => (
                  <li key={appointment.id} className="border-b border-border last:border-b-0">
                    <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={appointment.customerName} />

                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-card-foreground">
                              {appointment.customerName}
                            </span>
                            {appointment.sessionType === "GRUPO" ? (() => {
                              const svc = serviceById(appointment.serviceId)
                              const count = (appointment.groupParticipants ?? []).length
                              const max = svc?.maxGroupSize ?? count
                              return (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                                  <Users className="size-3" aria-hidden="true" />
                                  Grupo {count}/{max}
                                </span>
                              )
                            })() : null}
                          </div>
                          <span className="truncate text-xs text-muted-foreground">
                            {appointment.serviceName} · {modeLabels[appointment.mode]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
                          </span>
                          {appointment.rescheduleToken ? (
                            <Link
                              href={`/remarcar/${appointment.rescheduleToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 inline-flex w-fit items-center gap-1 text-xs text-primary transition-opacity hover:opacity-70"
                            >
                              <ExternalLink className="size-3" aria-hidden="true" />
                              Link de reagendamento
                            </Link>
                          ) : null}
                        </div>

                        <AppointmentBadge status={appointment.status} className="shrink-0 sm:hidden" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <AppointmentBadge status={appointment.status} className="hidden sm:inline-flex" />

                        {appointment.status === "AGUARDANDO" ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(appointment.id, "CONFIRMADO")}
                            className={`${actionButtonClass} bg-success-soft text-success-strong hover:opacity-80`}
                          >
                            <Check className="size-3.5" aria-hidden="true" />
                            Confirmar
                            <span className="sr-only">o atendimento de {appointment.customerName}</span>
                          </button>
                        ) : null}

                        {appointment.status === "CONFIRMADO" ? (
                          <button
                            type="button"
                            onClick={() => updateStatus(appointment.id, "CONCLUIDO")}
                            className={`${actionButtonClass} bg-primary-soft text-accent-foreground hover:opacity-80`}
                          >
                            <CheckCheck className="size-3.5" aria-hidden="true" />
                            Concluir
                            <span className="sr-only">o atendimento de {appointment.customerName}</span>
                          </button>
                        ) : null}

                        {appointment.status === "AGUARDANDO" || appointment.status === "CONFIRMADO" ? (
                          <button
                            type="button"
                            onClick={() => setPendingCancel(appointment)}
                            className={`${actionButtonClass} text-muted-foreground hover:bg-danger-soft hover:text-danger-strong`}
                          >
                            <X className="size-3.5" aria-hidden="true" />
                            Cancelar
                            <span className="sr-only">o atendimento de {appointment.customerName}</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })
      )}

      <Dialog
        open={pendingCancel !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCancel(null)
        }}
        title="Cancelar atendimento"
        description={
          pendingCancel
            ? `${pendingCancel.customerName} · ${formatDayMonth(pendingCancel.startsAt)} às ${formatTime(pendingCancel.startsAt)}`
            : undefined
        }
        footer={
          <>
            <button type="button" onClick={() => setPendingCancel(null)} className={dialogButtonClass.secondary}>
              Manter atendimento
            </button>
            <button type="button" onClick={confirmCancel} className={dialogButtonClass.danger}>
              Cancelar atendimento
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          O horário volta a ficar livre na agenda e o cliente será avisado do cancelamento. Esta ação não pode ser
          desfeita.
        </p>
      </Dialog>
    </div>
  )
}
