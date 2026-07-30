import type {
  Charge,
  CreateChargeInput,
  FinanceFilters,
  FinanceSummary,
  OpenCustomerBalance,
  PixChargeInfo,
  RegisterPaymentInput,
} from "@assistpro/types"
import { apiFetch, IS_MOCK } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
async function getMockCharges() {
  const { charges } = await import("@/lib/mock/finance")
  return charges
}

// ── Cobranças ───────────────────────────────────────────────────────────────

/** Lista cobranças com filtros de período e status. */
export async function listCharges(filters?: Partial<FinanceFilters>): Promise<Charge[]> {
  if (IS_MOCK) return getMockCharges()
  const params = new URLSearchParams()
  if (filters?.period) params.set("period", filters.period)
  if (filters?.status && filters.status !== "TODOS") params.set("status", filters.status)
  return apiFetch<Charge[]>(`/finance/charges?${params}`)
}

/** Cria uma nova cobrança. */
export async function createCharge(input: CreateChargeInput): Promise<Charge> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Charge>("/finance/charges", { method: "POST", body: input })
}

/** Registra pagamento manual de uma cobrança. */
export async function registerPayment(input: RegisterPaymentInput): Promise<Charge> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Charge>("/finance/charges/register-payment", { method: "POST", body: input })
}

/** Cancela uma cobrança. */
export async function cancelCharge(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/finance/charges/${id}`, { method: "DELETE" })
}

// ── Resumo financeiro ───────────────────────────────────────────────────────

/** Retorna o resumo financeiro do período atual. */
export async function getFinanceSummary(period: FinanceFilters["period"]): Promise<FinanceSummary> {
  if (IS_MOCK) {
    const { getFinanceSummary: mockSummary } = await import("@/lib/finance")
    return mockSummary(period)
  }
  return apiFetch<FinanceSummary>(`/finance/summary?period=${period}`)
}

// ── PIX ─────────────────────────────────────────────────────────────────────

/** Gera o payload PIX de uma cobrança. */
export async function getPixCharge(chargeId: string): Promise<PixChargeInfo> {
  if (IS_MOCK) {
    const { mockPixCharge } = await import("@/lib/mock/finance")
    return mockPixCharge(chargeId)
  }
  return apiFetch<PixChargeInfo>(`/finance/charges/${chargeId}/pix`)
}

// ── Inadimplência ───────────────────────────────────────────────────────────

/** Lista clientes com saldo em aberto (inadimplentes). */
export async function listOverdueBalances(): Promise<OpenCustomerBalance[]> {
  if (IS_MOCK) {
    const { openBalances } = await import("@/lib/mock/finance")
    return openBalances
  }
  return apiFetch<OpenCustomerBalance[]>("/finance/overdue")
}
