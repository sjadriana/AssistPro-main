import {
  dismissAssistantEvent,
  getDashboardMetrics,
  listAssistantEvents,
} from "@/lib/api/assistant"
import type { AssistantEvent, DashboardMetrics } from "@assistpro/types"
import useSWR from "swr"

export function useAssistantEvents() {
  const { data, isLoading, error, mutate } = useSWR<AssistantEvent[]>(
    "assistant-events",
    listAssistantEvents,
    { refreshInterval: 60_000 }, // revalida a cada 1 minuto
  )

  async function dismiss(id: string) {
    await dismissAssistantEvent(id)
    mutate((prev) => prev?.filter((e) => e.id !== id), false)
  }

  return { events: data ?? [], isLoading, error, dismiss }
}

export function useDashboardMetrics() {
  const { data, isLoading, error } = useSWR<DashboardMetrics>(
    "dashboard-metrics",
    getDashboardMetrics,
    { refreshInterval: 30_000 }, // revalida a cada 30 segundos
  )
  return { metrics: data ?? null, isLoading, error }
}
