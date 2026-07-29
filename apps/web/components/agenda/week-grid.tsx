"use client"

import {
  agendaHours,
  appointmentsForDate,
  buildWeek,
  durationMinutes,
  HOUR_HEIGHT,
  offsetMinutes,
  slotColorClass,
} from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { services } from "@/lib/mock/services"
import type { Appointment } from "@assistpro/types"
import { cn, formatTime } from "@assistpro/ui"
import Link from "next/link"

/** Minutos desde a meia-noite para posicionar o marcador de "agora". */
const _nowDate = new Date()
const NOW_OFFSET_MINUTES = _nowDate.getHours() * 60 + _nowDate.getMinutes()
const NOW_TIME_LABEL = `${String(_nowDate.getHours()).padStart(2, "0")}:${String(_nowDate.getMinutes()).padStart(2, "0")}`

function serviceColor(appointment: Appointment) {
  return services.find((service) => service.id === appointment.serviceId)?.color ?? "violet"
}

export function WeekGrid({ weekStart, today }: { weekStart: string; today: string }) {
  const week = buildWeek(weekStart, today)
  const gridHeight = (agendaHours.length - 1) * HOUR_HEIGHT

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="flex border-b border-border">
            <div className="w-14 shrink-0" />
            {week.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1 py-3">
                <span className="text-xs font-medium text-muted-foreground">{day.weekdayLabel}</span>
                <span
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                    day.isToday ? "bg-primary text-primary-foreground" : "text-card-foreground",
                  )}
                >
                  {day.dayNumber}
                </span>
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="w-14 shrink-0" style={{ height: gridHeight }}>
              {agendaHours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: index === agendaHours.length - 1 ? 0 : HOUR_HEIGHT }}>
                  <span className="absolute -top-2 right-2 text-[11px] font-medium text-muted-foreground">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            <div className="relative flex flex-1" style={{ height: gridHeight }}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {agendaHours.slice(0, -1).map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-t border-border/70"
                    style={{ top: index * HOUR_HEIGHT }}
                  />
                ))}
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                style={{ top: (NOW_OFFSET_MINUTES / 60) * HOUR_HEIGHT }}
              >
                <span className="-ml-14 w-14 pr-1 text-right text-[10px] font-semibold text-danger-strong">{NOW_TIME_LABEL}</span>
                <span className="h-px flex-1 bg-danger" />
              </div>

              {week.map((day) => {
                const dayAppointments = appointmentsForDate(appointments, day.date)

                return (
                  <div key={day.date} className="relative flex-1 border-l border-border/70 first:border-l-0">
                    {dayAppointments.map((appointment) => {
                      const top = (offsetMinutes(appointment.startsAt) / 60) * HOUR_HEIGHT
                      const height = Math.max(
                        (durationMinutes(appointment.startsAt, appointment.endsAt) / 60) * HOUR_HEIGHT - 4,
                        34,
                      )
                      const cancelled = appointment.status === "CANCELADO"
                      const compact = height < 48

                      return (
                        <Link
                          key={appointment.id}
                          href={`/clientes/${appointment.customerId}`}
                          style={{ top, height }}
                          className={cn(
                            "absolute inset-x-1 flex flex-col overflow-hidden rounded-lg border-l-3 px-2 py-1 leading-tight transition-opacity hover:opacity-80",
                            slotColorClass(serviceColor(appointment), cancelled),
                          )}
                        >
                          <span className="text-[10px] font-semibold opacity-80">
                            {formatTime(appointment.startsAt)}
                          </span>
                          <span
                            className={cn("truncate text-[11px] font-semibold", cancelled && "line-through")}
                          >
                            {appointment.customerName}
                          </span>
                          {compact ? null : (
                            <span className="truncate text-[10px] opacity-80">{appointment.serviceName}</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
