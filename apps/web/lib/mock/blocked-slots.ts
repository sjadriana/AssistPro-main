import type { BlockedSlot } from "@assistpro/types"

const now = "2024-05-22T12:00:00.000Z"
const base = { createdAt: now, updatedAt: now, deletedAt: null }

/**
 * Intervalos bloqueados de demonstração.
 * Horários bloqueados não aparecem como disponíveis no formulário de atendimento.
 */
export const blockedSlots: BlockedSlot[] = [
  // Quinta-feira 23/05: tarde toda bloqueada (reunião)
  {
    ...base,
    id: "blk-1",
    startsAt: new Date("2024-05-23T17:00:00.000-03:00").toISOString(),
    endsAt: new Date("2024-05-23T18:00:00.000-03:00").toISOString(),
    allDay: false,
    reason: "Reunião administrativa",
  },
  // Sexta-feira 24/05: dia inteiro bloqueado
  {
    ...base,
    id: "blk-2",
    startsAt: new Date("2024-05-24T07:00:00.000-03:00").toISOString(),
    endsAt: new Date("2024-05-24T18:00:00.000-03:00").toISOString(),
    allDay: true,
    reason: "Folga",
  },
]
