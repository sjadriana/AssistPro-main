import {
  getFinanceSummary,
  listCharges,
  listOverdueBalances,
} from "@/lib/api/finance"
import type {
  Charge,
  FinanceFilters,
  FinanceSummary,
  OpenCustomerBalance,
} from "@assistpro/types"
import useSWR from "swr"

export function useCharges(filters?: Partial<FinanceFilters>) {
  const key = ["charges", filters?.period ?? "ESTE_MES", filters?.status ?? "TODOS"]
  const { data, isLoading, error, mutate } = useSWR<Charge[]>(
    key,
    () => listCharges(filters),
  )
  return { charges: data ?? [], isLoading, error, mutate }
}

export function useFinanceSummary(period: FinanceFilters["period"] = "ESTE_MES") {
  const { data, isLoading, error } = useSWR<FinanceSummary>(
    ["finance-summary", period],
    () => getFinanceSummary(period),
  )
  return { summary: data ?? null, isLoading, error }
}

export function useOverdueBalances() {
  const { data, isLoading, error, mutate } = useSWR<OpenCustomerBalance[]>(
    "overdue-balances",
    listOverdueBalances,
  )
  return { balances: data ?? [], isLoading, error, mutate }
}
