"use client"

import { appointmentsForDate } from "@/lib/agenda"
import { appointments } from "@/lib/mock/appointments"
import { cn } from "@assistpro/ui"

const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

/** Calcula células para o mês de `monthStart` (YYYY-MM-01). */
function buildMonthCells(monthStart: string): { day: number | null; date: string | null }[] {
  const [y, m] = monthStart.split("-").map(Number)
  const year = y
  const month = m - 1 // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // 0=Dom → queremos Seg=0, então (getDay()+6)%7
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: { day: number | null; date: string | null }[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, date: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0")
    const dd = String(d).padStart(2, "0")
    cells.push({ day: d, date: `${year}-${mm}-${dd}` })
  }
  return cells
}

export function MonthGrid({ monthStart, today }: { monthStart: string; today: string }) {
  const cells = buildMonthCells(monthStart)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="grid grid-cols-7 border-b border-border">
        {weekdayLabels.map((label) => (
          <span key={label} className="py-2.5 text-center text-xs font-medium text-muted-foreground">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          if (cell.day === null) {
            return <div key={`blank-${index}`} className="min-h-20 border-r border-b border-border/70 bg-secondary/40" />
          }

          const { day, date } = cell
          const dayAppointments = appointmentsForDate(appointments, date!)
          const isToday = date === today

          return (
            <div key={date!} className="flex min-h-20 flex-col gap-1 border-r border-b border-border/70 p-1.5">
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-card-foreground",
                )}
              >
                {day}
              </span>

              <div className="flex flex-col gap-1">
                {dayAppointments.slice(0, 2).map((appointment) => (
                  <span
                    key={appointment.id}
                    className="truncate rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground"
                  >
                    {appointment.customerName}
                  </span>
                ))}
                {dayAppointments.length > 2 ? (
                  <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
                    +{dayAppointments.length - 2}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
