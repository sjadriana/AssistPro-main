import { AGENDA_END_HOUR, AGENDA_START_HOUR, DEFAULT_APPOINTMENT_DURATION, DISPLAY_TIMEZONE } from "@assistpro/config"
import type { Appointment, BlockedSlot, BusinessHours, FreeSlot, ServiceColor } from "@assistpro/types"

/** Altura de uma hora na grade, em pixels. */
export const HOUR_HEIGHT = 56

export const agendaHours = Array.from(
  { length: AGENDA_END_HOUR - AGENDA_START_HOUR + 1 },
  (_, index) => AGENDA_START_HOUR + index,
)

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const

/** Partes de data/hora no fuso de exibição, independente do fuso do servidor. */
export function displayParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso))

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00"

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

/** Minutos desde o início da grade (07:00). */
export function offsetMinutes(iso: string) {
  const { hour, minute } = displayParts(iso)
  return (hour - AGENDA_START_HOUR) * 60 + minute
}

export function durationMinutes(startsAt: string, endsAt: string) {
  return (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000
}

export interface AgendaDay {
  /** Data no formato YYYY-MM-DD. */
  date: string
  weekdayLabel: string
  dayNumber: number
  isToday: boolean
}

/** Semana de referência da demonstração: 19 a 25 de maio de 2024. */
export function buildWeek(startDate: string, todayDate: string): AgendaDay[] {
  const [year, month, day] = startDate.split("-").map(Number)

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(Date.UTC(year, month - 1, day + index))
    const date = current.toISOString().slice(0, 10)

    return {
      date,
      weekdayLabel: weekdayLabels[current.getUTCDay()],
      dayNumber: current.getUTCDate(),
      isToday: date === todayDate,
    }
  })
}

const serviceColorClasses: Record<ServiceColor, string> = {
  emerald: "border-l-success bg-success-soft text-success-strong",
  violet: "border-l-primary bg-primary-soft text-accent-foreground",
  amber: "border-l-warning bg-warning-soft text-warning-strong",
  rose: "border-l-danger bg-danger-soft text-danger-strong",
  sky: "border-l-chart-5 bg-secondary text-secondary-foreground",
}

export function slotColorClass(color: ServiceColor, cancelled: boolean) {
  if (cancelled) return "border-l-danger bg-danger-soft text-danger-strong"
  return serviceColorClasses[color]
}

export function appointmentsForDate(appointments: Appointment[], date: string) {
  return appointments.filter((appointment) => displayParts(appointment.startsAt).date === date)
}

/** Ordem usada em `BusinessHours.weekday`, indexada por `Date.getUTCDay()`. */
const weekdayKeys = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"] as const

function minutesFromTime(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

/**
 * Converte uma data local (YYYY-MM-DD) mais minutos locais em um instante UTC.
 *
 * O offset de São Paulo é descoberto comparando o horário local formatado com o
 * UTC do mesmo instante, então continua correto se o horário de verão voltar.
 */
function localToUtc(date: string, minutes: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const naive = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60)

  const probe = new Date(naive)
  const parts = displayParts(probe.toISOString())
  const localMinutes = parts.hour * 60 + parts.minute
  // Diferença entre o que queríamos e o que o fuso mostrou.
  let drift = localMinutes - minutes
  // Normaliza viradas de dia (ex.: -1425 na prática é +15).
  if (drift > 720) drift -= 1440
  if (drift < -720) drift += 1440

  return new Date(naive - drift * 60_000).toISOString()
}

/**
 * Janelas livres dentro do horário comercial, em blocos de `slotMinutes`.
 *
 * Um bloco é descartado quando encosta em qualquer atendimento não cancelado, e
 * blocos já passados não são oferecidos — ninguém quer receber convite para
 * ontem. `nowIso` permite testar sem depender do relógio real.
 */
export function freeSlotsForRange(
  appointments: Appointment[],
  businessHours: BusinessHours[],
  dates: string[],
  slotMinutes: number = DEFAULT_APPOINTMENT_DURATION,
  nowIso?: string,
): FreeSlot[] {
  const hoursByWeekday = new Map(businessHours.map((entry) => [entry.weekday, entry]))
  const nowTime = nowIso ? new Date(nowIso).getTime() : Number.NEGATIVE_INFINITY
  const slots: FreeSlot[] = []

  // Só atendimentos ativos bloqueiam a agenda; cancelado libera o horário.
  const busy = appointments
    .filter((appointment) => appointment.status !== "CANCELADO")
    .map((appointment) => ({
      start: new Date(appointment.startsAt).getTime(),
      end: new Date(appointment.endsAt).getTime(),
    }))

  for (const date of dates) {
    const [year, month, day] = date.split("-").map(Number)
    const weekday = weekdayKeys[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
    const hours = hoursByWeekday.get(weekday)
    if (!hours?.enabled) continue

    const opensAt = minutesFromTime(hours.from)
    const closesAt = minutesFromTime(hours.to)

    for (let cursor = opensAt; cursor + slotMinutes <= closesAt; cursor += slotMinutes) {
      const startsAt = localToUtc(date, cursor)
      const endsAt = localToUtc(date, cursor + slotMinutes)
      const start = new Date(startsAt).getTime()
      const end = new Date(endsAt).getTime()

      if (start < nowTime) continue
      if (busy.some((entry) => start < entry.end && end > entry.start)) continue

      slots.push({ id: `free-${date}-${cursor}`, date, startsAt, endsAt })
    }
  }

  return slots
}

/**
 * Retorna os horários disponíveis para agendamento em uma data específica, no
 * formato HH:MM. Leva em conta: horário comercial, atendimentos existentes e
 * bloqueios. Datas no passado retornam array vazio.
 */
export function availableTimesForDate(
  date: string,
  appointments: Appointment[],
  blockedSlots: BlockedSlot[],
  businessHours: BusinessHours[],
  durationMinutes: number,
  nowIso: string,
): string[] {
  // Datas passadas: nenhum horário disponível
  if (date <= nowIso.slice(0, 10)) return []

  const weekdayKeys = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"] as const
  const [year, month, day] = date.split("-").map(Number)
  const weekday = weekdayKeys[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  const hours = businessHours.find((entry) => entry.weekday === weekday)
  if (!hours?.enabled) return []

  function minutesFromTime(time: string) {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const opensAt = minutesFromTime(hours.from)
  const closesAt = minutesFromTime(hours.to)

  // Intervalos ocupados: atendimentos não cancelados + bloqueios
  const busy: { start: number; end: number }[] = []

  for (const apt of appointments) {
    if (apt.status === "CANCELADO") continue
    const startDisplay = displayParts(apt.startsAt)
    if (startDisplay.date !== date) continue
    const endMs = new Date(apt.endsAt).getTime()
    const startMinutes = startDisplay.hour * 60 + startDisplay.minute
    const endMinutes = startMinutes + Math.ceil((endMs - new Date(apt.startsAt).getTime()) / 60000)
    busy.push({ start: startMinutes, end: endMinutes })
  }

  for (const block of blockedSlots) {
    if (block.deletedAt) continue
    if (block.allDay) {
      const blockDate = displayParts(block.startsAt).date
      if (blockDate === date) return [] // dia inteiro bloqueado
    } else {
      const blockStart = displayParts(block.startsAt)
      if (blockStart.date !== date) continue
      const blockEnd = displayParts(block.endsAt)
      busy.push({
        start: blockStart.hour * 60 + blockStart.minute,
        end: blockEnd.hour * 60 + blockEnd.minute,
      })
    }
  }

  const times: string[] = []
  for (let cursor = opensAt; cursor + durationMinutes <= closesAt; cursor += 30) {
    const end = cursor + durationMinutes
    const overlaps = busy.some((entry) => cursor < entry.end && end > entry.start)
    if (!overlaps) {
      const h = String(Math.floor(cursor / 60)).padStart(2, "0")
      const m = String(cursor % 60).padStart(2, "0")
      times.push(`${h}:${m}`)
    }
  }

  return times
}

/**
 * Retorna true se a data (YYYY-MM-DD) é hoje ou no passado,
 * usando `todayDate` como referência para facilitar testes.
 */
export function isDateInPastOrToday(date: string, todayDate: string): boolean {
  return date <= todayDate
}

/** Rótulo curto do slot: "Qua, 22/05 · 15:00". */
export function formatSlotLabel(slot: FreeSlot): string {
  const [year, month, day] = slot.date.split("-").map(Number)
  const weekday = weekdayLabels[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  const { hour, minute } = displayParts(slot.startsAt)
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`

  return `${weekday}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")} · ${time}`
}

/** Agrupa os slots por dia, preservando a ordem cronológica. */
export function groupSlotsByDate(slots: FreeSlot[]): { date: string; label: string; slots: FreeSlot[] }[] {
  const groups = new Map<string, FreeSlot[]>()

  for (const slot of slots) {
    const existing = groups.get(slot.date)
    if (existing) existing.push(slot)
    else groups.set(slot.date, [slot])
  }

  return [...groups.entries()].map(([date, items]) => {
    const [year, month, day] = date.split("-").map(Number)
    const weekday = weekdayLabels[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

    return {
      date,
      label: `${weekday}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`,
      slots: items,
    }
  })
}
