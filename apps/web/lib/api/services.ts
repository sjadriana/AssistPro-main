import type { BusinessHours, RecurringSchedule, Service } from "@assistpro/types"
import { apiFetch, IS_MOCK } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
async function getMockServices() {
  const { services } = await import("@/lib/mock/services")
  return services
}
async function getMockBusinessHours() {
  const { businessHours } = await import("@/lib/mock/services")
  return businessHours
}
async function getMockSchedules() {
  const { recurringSchedules } = await import("@/lib/mock/recurring-schedules")
  return recurringSchedules
}

// ── Serviços ────────────────────────────────────────────────────────────────

/** Lista todos os serviços do profissional. */
export async function listServices(): Promise<Service[]> {
  if (IS_MOCK) return getMockServices()
  return apiFetch<Service[]>("/services")
}

/** Cria um novo serviço. */
export async function createService(
  input: Omit<Service, "id" | "createdAt" | "updatedAt" | "deletedAt">,
): Promise<Service> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Service>("/services", { method: "POST", body: input })
}

/** Atualiza um serviço existente. */
export async function updateService(
  id: string,
  input: Partial<Omit<Service, "id" | "createdAt" | "updatedAt" | "deletedAt">>,
): Promise<Service> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Service>(`/services/${id}`, { method: "PATCH", body: input })
}

/** Remove (soft-delete) um serviço. */
export async function deleteService(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/services/${id}`, { method: "DELETE" })
}

// ── Horários de atendimento ─────────────────────────────────────────────────

/** Retorna os horários de atendimento do profissional. */
export async function getBusinessHours(): Promise<BusinessHours[]> {
  if (IS_MOCK) return getMockBusinessHours()
  return apiFetch<BusinessHours[]>("/settings/business-hours")
}

/** Salva os horários de atendimento. */
export async function saveBusinessHours(hours: BusinessHours[]): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>("/settings/business-hours", { method: "PUT", body: hours })
}

// ── Grades fixas recorrentes ────────────────────────────────────────────────

/** Lista as grades fixas do profissional. */
export async function listRecurringSchedules(): Promise<RecurringSchedule[]> {
  if (IS_MOCK) return getMockSchedules()
  return apiFetch<RecurringSchedule[]>("/schedules")
}

/** Cria uma grade fixa. */
export async function createRecurringSchedule(
  input: Omit<RecurringSchedule, "id" | "createdAt" | "updatedAt">,
): Promise<RecurringSchedule> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<RecurringSchedule>("/schedules", { method: "POST", body: input })
}

/** Atualiza uma grade fixa. */
export async function updateRecurringSchedule(
  id: string,
  input: Partial<Omit<RecurringSchedule, "id" | "createdAt" | "updatedAt">>,
): Promise<RecurringSchedule> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<RecurringSchedule>(`/schedules/${id}`, { method: "PATCH", body: input })
}

/** Remove uma grade fixa. */
export async function deleteRecurringSchedule(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/schedules/${id}`, { method: "DELETE" })
}

// ── Vitrine pública ─────────────────────────────────────────────────────────

/** Busca dados públicos de uma grade (sem autenticação). */
export async function getPublicSchedule(scheduleId: string): Promise<RecurringSchedule> {
  if (IS_MOCK) {
    const list = await getMockSchedules()
    const found = list.find((s) => s.id === scheduleId)
    if (!found) throw new Error(`Schedule ${scheduleId} not found`)
    return found
  }
  return apiFetch<RecurringSchedule>(`/public/schedules/${scheduleId}`)
}
