import {
  getBusinessHours,
  listRecurringSchedules,
  listServices,
  saveBusinessHours,
} from "@/lib/api/services"
import type { BusinessHours, RecurringSchedule, Service } from "@assistpro/types"
import useSWR from "swr"

export function useServices() {
  const { data, isLoading, error, mutate } = useSWR<Service[]>("services", listServices)
  return { services: data ?? [], isLoading, error, mutate }
}

export function useBusinessHours() {
  const { data, isLoading, error, mutate } = useSWR<BusinessHours[]>(
    "business-hours",
    getBusinessHours,
  )

  async function save(hours: BusinessHours[]) {
    await saveBusinessHours(hours)
    mutate(hours, false)
  }

  return { hours: data ?? [], isLoading, error, save }
}

export function useRecurringSchedules() {
  const { data, isLoading, error, mutate } = useSWR<RecurringSchedule[]>(
    "recurring-schedules",
    listRecurringSchedules,
  )
  return { schedules: data ?? [], isLoading, error, mutate }
}
