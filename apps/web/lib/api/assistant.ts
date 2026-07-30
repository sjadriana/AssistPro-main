import type { AssistantEvent, DashboardMetrics } from "@assistpro/types"
import { apiFetch, IS_MOCK } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
async function getMockEvents() {
  const { assistantEvents } = await import("@/lib/mock/assistant")
  return assistantEvents
}
async function getMockMetrics() {
  const { dashboardMetrics } = await import("@/lib/mock/assistant")
  return dashboardMetrics
}

// ── API ─────────────────────────────────────────────────────────────────────

/** Lista os eventos recentes da assistente para o feed do dashboard. */
export async function listAssistantEvents(): Promise<AssistantEvent[]> {
  if (IS_MOCK) return getMockEvents()
  return apiFetch<AssistantEvent[]>("/assistant/events")
}

/** Descarta (dismiss) um evento da assistente. */
export async function dismissAssistantEvent(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/assistant/events/${id}`, { method: "DELETE" })
}

/** Retorna as métricas do dashboard (contadores do topo). */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (IS_MOCK) return getMockMetrics()
  return apiFetch<DashboardMetrics>("/assistant/metrics")
}
