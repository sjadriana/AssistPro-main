import type { BusinessHours, Service } from "@assistpro/types"

const now = "2024-05-22T12:00:00.000Z"

const base = { createdAt: now, updatedAt: now, deletedAt: null }

export const services: Service[] = [
  // maxGroupSize: 6 → Aula de Tênis pode ter até 6 alunos por sessão
  { ...base, id: "svc-1", name: "Aula de Tênis", durationMinutes: 60, price: 12000, color: "emerald", active: true, maxGroupSize: 6 },
  // Personal é individual por natureza
  { ...base, id: "svc-2", name: "Personal", durationMinutes: 60, price: 20000, color: "violet", active: true, maxGroupSize: null },
  { ...base, id: "svc-3", name: "Fisioterapia", durationMinutes: 50, price: 18000, color: "amber", active: true, maxGroupSize: null },
  { ...base, id: "svc-4", name: "Mensalidade", durationMinutes: 0, price: 24000, color: "sky", active: true, maxGroupSize: null },
]

export const businessHours: BusinessHours[] = [
  { weekday: "SEG", enabled: true, from: "07:00", to: "18:00" },
  { weekday: "TER", enabled: true, from: "07:00", to: "18:00" },
  { weekday: "QUA", enabled: true, from: "07:00", to: "18:00" },
  { weekday: "QUI", enabled: true, from: "07:00", to: "18:00" },
  { weekday: "SEX", enabled: true, from: "07:00", to: "18:00" },
  { weekday: "SAB", enabled: true, from: "08:00", to: "12:00" },
  { weekday: "DOM", enabled: false, from: "08:00", to: "12:00" },
]

export function serviceById(id: string) {
  return services.find((service) => service.id === id) ?? null
}
