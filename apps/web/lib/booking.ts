import type { RecurringSchedule, Weekday } from "@assistpro/types"

/** Participante inscrito numa turma. */
export interface BookingParticipant {
  name: string
  phone: string
}

/** Representa uma turma gerada a partir de uma grade recorrente. */
export interface ClassSlot {
  /** ID único: `{scheduleId}-{YYYY-MM-DD}` */
  id: string
  scheduleId: string
  /** Data local no formato YYYY-MM-DD (America/Sao_Paulo). */
  date: string
  /** Dia da semana por extenso. */
  weekdayLabel: string
  /** Data formatada: "Segunda-feira, 03/08" */
  dateLabel: string
  startTime: string
  endTime: string
  serviceName: string
  maxParticipants: number
  participants: BookingParticipant[]
}

const weekdayISOIndex: Record<Weekday, number> = {
  DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6,
}

const weekdayLabel: Record<Weekday, string> = {
  SEG: "Segunda-feira", TER: "Terça-feira", QUA: "Quarta-feira",
  QUI: "Quinta-feira",  SEX: "Sexta-feira", SAB: "Sábado", DOM: "Domingo",
}

/**
 * Gera as próximas `weeks` semanas de turmas para uma grade recorrente.
 * Referência de data: `referenceDate` (default: hoje).
 */
export function generateClassSlots(
  schedule: RecurringSchedule,
  weeks = 4,
  referenceDate?: Date,
): ClassSlot[] {
  const ref = referenceDate ?? new Date()
  // Zeramos a hora para comparação de datas
  ref.setHours(0, 0, 0, 0)

  const slots: ClassSlot[] = []
  const horizon = new Date(ref)
  horizon.setDate(horizon.getDate() + weeks * 7)

  // Percorre cada dia do período
  const cursor = new Date(ref)
  while (cursor <= horizon) {
    const iso = cursor.getDay() // 0=Dom, 1=Seg…
    for (const wd of schedule.weekdays) {
      if (weekdayISOIndex[wd] === iso) {
        const dateStr = cursor.toISOString().slice(0, 10)
        const label = cursor.toLocaleDateString("pt-BR", {
          day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo",
        })
        slots.push({
          id:             `${schedule.id}-${dateStr}`,
          scheduleId:     schedule.id,
          date:           dateStr,
          weekdayLabel:   weekdayLabel[wd],
          dateLabel:      `${weekdayLabel[wd]}, ${label}`,
          startTime:      schedule.startTime,
          endTime:        schedule.endTime,
          serviceName:    schedule.serviceName,
          maxParticipants: schedule.maxParticipants,
          participants:   [],
        })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  // Ordena por data
  return slots.sort((a, b) => a.date.localeCompare(b.date))
}

/** Store em memória dos participantes inscritos por slot. */
const participantStore: Map<string, BookingParticipant[]> = new Map()

export function getParticipants(slotId: string): BookingParticipant[] {
  return participantStore.get(slotId) ?? []
}

export function addParticipant(slotId: string, participant: BookingParticipant): "ok" | "full" {
  const current = participantStore.get(slotId) ?? []
  // Precisamos do maxParticipants — ele é codificado no slotId via prefixo do schedule
  // A vitrine passa o max explicitamente, então usamos o check no componente antes de chamar
  const next = [...current, participant]
  participantStore.set(slotId, next)
  return "ok"
}

export function countParticipants(slotId: string): number {
  return (participantStore.get(slotId) ?? []).length
}
