import type { RecurringSchedule } from "@assistpro/types"

const now = "2024-05-22T12:00:00.000Z"
const base = { createdAt: now, updatedAt: now }

export let recurringSchedules: RecurringSchedule[] = [
  {
    ...base,
    id: "rs-1",
    serviceId: "svc-1",
    serviceName: "Aula de Tênis",
    weekdays: ["SEG", "QUA", "SEX"],
    startTime: "07:00",
    endTime: "08:00",
    maxParticipants: 6,
    active: true,
  },
  {
    ...base,
    id: "rs-2",
    serviceId: "svc-1",
    serviceName: "Aula de Tênis",
    weekdays: ["TER", "QUI"],
    startTime: "18:00",
    endTime: "19:00",
    maxParticipants: 4,
    active: true,
  },
]

export function addRecurringSchedule(schedule: RecurringSchedule) {
  recurringSchedules = [...recurringSchedules, schedule]
}

export function updateRecurringSchedule(id: string, patch: Partial<RecurringSchedule>) {
  recurringSchedules = recurringSchedules.map((rs) => (rs.id === id ? { ...rs, ...patch } : rs))
}

export function deleteRecurringSchedule(id: string) {
  recurringSchedules = recurringSchedules.filter((rs) => rs.id !== id)
}
