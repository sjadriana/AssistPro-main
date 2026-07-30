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

/**
 * Retorna o resumo financeiro calculado a partir das cobranças do mock.
 * recalculateSummary(charges) é a função existente em lib/finance.ts.
 */
export async function getFinanceSummary(period: FinanceFilters["period"]): Promise<FinanceSummary> {
  if (IS_MOCK) {
    const { charges } = await import("@/lib/mock/finance")
    const { filterByPeriod, recalculateSummary } = await import("@/lib/finance")
    const filtered = filterByPeriod(charges, period)
    return recalculateSummary(filtered)
  }
  return apiFetch<FinanceSummary>(`/finance/summary?period=${period}`)
}

// ── PIX ─────────────────────────────────────────────────────────────────────

/** Gera o payload PIX de uma cobrança. */
export async function getPixCharge(chargeId: string): Promise<PixChargeInfo> {
  if (IS_MOCK) {
    const { charges, pixKey } = await import("@/lib/mock/finance")
    const { buildPixPayload } = await import("@/lib/finance")
    const charge = charges.find((c) => c.id === chargeId)
    if (!charge) throw new Error(`Charge ${chargeId} not found`)
    return buildPixPayload(charge, pixKey)
  }
  return apiFetch<PixChargeInfo>(`/finance/charges/${chargeId}/pix`)
}

// ── Inadimplência ───────────────────────────────────────────────────────────

/** Lista clientes com saldo em aberto (inadimplentes). */
export async function listOverdueBalances(): Promise<OpenCustomerBalance[]> {
  if (IS_MOCK) {
    const { charges } = await import("@/lib/mock/finance")
    const { customers } = await import("@/lib/mock/customers")
    const { openBalancesByCustomer } = await import("@/lib/finance")
    return openBalancesByCustomer(charges, customers)
  }
  return apiFetch<OpenCustomerBalance[]>("/finance/overdue")
}
