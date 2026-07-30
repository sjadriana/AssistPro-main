import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentInput,
  CreateBlockedSlotInput,
  BlockedSlot,
  ShareSlotsInput,
  FreeSlot,
} from "@assistpro/types"
import { apiFetch, IS_MOCK } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
async function getMockAppointments() {
  const { appointments } = await import("@/lib/mock/appointments")
  return appointments
}
async function getMockBlockedSlots() {
  const { blockedSlots } = await import("@/lib/mock/blocked-slots")
  return blockedSlots
}

// ── API ─────────────────────────────────────────────────────────────────────

/** Lista todos os agendamentos, com filtros opcionais. */
export async function listAppointments(filters?: Partial<AppointmentFilters>): Promise<Appointment[]> {
  if (IS_MOCK) return getMockAppointments()
  const params = new URLSearchParams()
  if (filters?.query)  params.set("query", filters.query)
  if (filters?.status && filters.status !== "TODOS") params.set("status", filters.status)
  return apiFetch<Appointment[]>(`/appointments?${params}`)
}

/** Busca um único agendamento pelo id. */
export async function getAppointment(id: string): Promise<Appointment> {
  if (IS_MOCK) {
    const list = await getMockAppointments()
    const found = list.find((a) => a.id === id)
    if (!found) throw new Error(`Appointment ${id} not found`)
    return found
  }
  return apiFetch<Appointment>(`/appointments/${id}`)
}

/** Cria um ou mais agendamentos (um por data selecionada). */
export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment[]> {
  if (IS_MOCK) {
    // No mock apenas retornamos um array vazio — o formulário já navega para /agenda
    return []
  }
  return apiFetch<Appointment[]>("/appointments", { method: "POST", body: input })
}

/** Atualiza status de um agendamento. */
export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<Appointment> {
  if (IS_MOCK) {
    const list = await getMockAppointments()
    const found = list.find((a) => a.id === id)
    if (!found) throw new Error(`Appointment ${id} not found`)
    return { ...found, status }
  }
  return apiFetch<Appointment>(`/appointments/${id}/status`, { method: "PATCH", body: { status } })
}

/** Cancela um agendamento. */
export async function cancelAppointment(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/appointments/${id}`, { method: "DELETE" })
}

// ── Horários livres ─────────────────────────────────────────────────────────

/** Lista horários livres do profissional para os próximos dias. */
export async function listFreeSlots(): Promise<FreeSlot[]> {
  if (IS_MOCK) {
    const { freeSlotsForRange } = await import("@/lib/agenda")
    const { businessHours } = await import("@/lib/mock/services")
    const { appointments } = await import("@/lib/mock/appointments")
    // Gera as datas dos próximos 7 dias
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000)
      return d.toISOString().slice(0, 10)
    })
    return freeSlotsForRange(appointments, businessHours, dates, 60)
  }
  return apiFetch<FreeSlot[]>("/appointments/free-slots")
}

/** Envia horários selecionados para um cliente via WhatsApp. */
export async function shareSlots(input: ShareSlotsInput): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>("/appointments/share-slots", { method: "POST", body: input })
}

// ── Bloqueios ───────────────────────────────────────────────────────────────

/** Lista os bloqueios de agenda. */
export async function listBlockedSlots(): Promise<BlockedSlot[]> {
  if (IS_MOCK) return getMockBlockedSlots()
  return apiFetch<BlockedSlot[]>("/appointments/blocked-slots")
}

/** Cria um bloqueio de agenda. */
export async function createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedSlot> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<BlockedSlot>("/appointments/blocked-slots", { method: "POST", body: input })
}

/** Remove um bloqueio de agenda. */
export async function deleteBlockedSlot(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/appointments/blocked-slots/${id}`, { method: "DELETE" })
}
