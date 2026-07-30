import {
  cancelAppointment,
  createAppointment,
  listAppointments,
  listBlockedSlots,
  listFreeSlots,
  updateAppointmentStatus,
} from "@/lib/api/appointments"
import type {
  Appointment,
  AppointmentFilters,
  AppointmentStatus,
  BlockedSlot,
  CreateAppointmentInput,
  FreeSlot,
} from "@assistpro/types"
import useSWR from "swr"

// ── Listagem ─────────────────────────────────────────────────────────────────

export function useAppointments(filters?: Partial<AppointmentFilters>) {
  const key = ["appointments", filters?.query ?? "", filters?.status ?? "TODOS"]
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

// ── Bloqueios ────────────────────────────────────────────────────────────────

export function useBlockedSlots() {
  const { data, isLoading, error, mutate } = useSWR<BlockedSlot[]>(
    "blocked-slots",
    listBlockedSlots,
  )
  return { blockedSlots: data ?? [], isLoading, error, mutate }
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useAppointmentMutations() {
  const { mutate } = useSWR<Appointment[]>("appointments")

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
