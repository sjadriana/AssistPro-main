import { listCustomers, listCustomerSummaries } from "@/lib/api/customers"
import type { Customer, CustomerSummary } from "@assistpro/types"
import useSWR from "swr"

export function useCustomers(query?: string) {
  const { data, isLoading, error, mutate } = useSWR<Customer[]>(
    ["customers", query ?? ""],
    () => listCustomers(query),
  )
  return { customers: data ?? [], isLoading, error, mutate }
}

export function useCustomerSummaries() {
  const { data, isLoading, error, mutate } = useSWR<CustomerSummary[]>(
    "customer-summaries",
    listCustomerSummaries,
  )
  return { summaries: data ?? [], isLoading, error, mutate }
}
