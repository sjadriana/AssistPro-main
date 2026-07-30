import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  listFreeSlots,
  updateAppointmentStatus,
} from "@/lib/api/appointments"
import type { Appointment, AppointmentStatus, FreeSlot } from "@assistpro/types"

type CreateAppointmentInput = Parameters<typeof createAppointment>[0]
import useSWR from "swr"

// ── Listagem ─────────────────────────────────────────────────────────────────

export function useAppointments(filters?: { status?: AppointmentStatus; date?: string; customerId?: string }) {
  const key = ["appointments", JSON.stringify(filters ?? {})]
  const { data, isLoading, error, mutate } = useSWR<Appointment[]>(
    key,
    () => listAppointments(filters),
  )
  return { appointments: data ?? [], isLoading, error, mutate }
}

// ── Horários livres ──────────────────────────────────────────────────────────

export function useFreeSlots() {
  const { data, isLoading, error, mutate } = useSWR<FreeSlot[]>(
    "free-slots",
    listFreeSlots,
  )
  return { freeSlots: data ?? [], isLoading, error, mutate }
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useAppointmentMutations() {
  const { mutate } = useSWR<Appointment[]>(["appointments", "{}"])

  async function create(input: CreateAppointmentInput) {
    await createAppointment(input)
    mutate()
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    await updateAppointmentStatus(id, status)
    mutate()
  }

  async function cancel(id: string) {
    await cancelAppointment(id)
    mutate()
  }

  return { create, updateStatus, cancel }
}
