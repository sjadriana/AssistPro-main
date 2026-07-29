"use client"

import { agendaHours, appointmentsForDate, displayParts } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { AppointmentBadge, formatTime } from "@assistpro/ui"
import { Plus } from "lucide-react"
import Link from "next/link"

export function DayList({ date }: { date: string }) {
  const dayAppointments = appointmentsForDate(appointments, date)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <ul className="flex flex-col">
        {agendaHours.slice(0, -1).map((hour) => {
          const appointment = dayAppointments.find((item) => displayParts(item.startsAt).hour === hour)

          return (
            <li key={hour} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
              <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>

              {appointment ? (
                <Link
                  href={`/clientes/${appointment.customerId}`}
                  className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-70"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-card-foreground">
                      {appointment.customerName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {appointment.serviceName} · {formatTime(appointment.startsAt)}
                    </span>
                  </span>
                  <AppointmentBadge status={appointment.status} />
                </Link>
              ) : (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Horário livre</span>
                  <Link
                    href="/atendimentos/novo"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-opacity hover:opacity-70"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="sr-only">Agendar às {String(hour).padStart(2, "0")}:00</span>
                  </Link>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
