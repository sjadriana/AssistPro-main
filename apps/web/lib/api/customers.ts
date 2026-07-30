import type { Customer, CustomerSummary } from "@assistpro/types"
import { apiFetch, IS_MOCK } from "./client"

// ── Mock fallbacks ──────────────────────────────────────────────────────────
async function getMockCustomers() {
  const { customers } = await import("@/lib/mock/customers")
  return customers
}

// ── API ─────────────────────────────────────────────────────────────────────

/** Lista todos os clientes, com busca textual opcional. */
export async function listCustomers(query?: string): Promise<Customer[]> {
  if (IS_MOCK) {
    const list = await getMockCustomers()
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    )
  }
  const params = query ? `?query=${encodeURIComponent(query)}` : ""
  return apiFetch<Customer[]>(`/customers${params}`)
}

/** Busca um cliente pelo id. */
export async function getCustomer(id: string): Promise<Customer> {
  if (IS_MOCK) {
    const list = await getMockCustomers()
    const found = list.find((c) => c.id === id)
    if (!found) throw new Error(`Customer ${id} not found`)
    return found
  }
  return apiFetch<Customer>(`/customers/${id}`)
}

/** Cria um novo cliente. */
export async function createCustomer(
  input: Omit<Customer, "id" | "createdAt" | "updatedAt" | "deletedAt" | "lastAppointmentAt">,
): Promise<Customer> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Customer>("/customers", { method: "POST", body: input })
}

/** Atualiza dados de um cliente. */
export async function updateCustomer(
  id: string,
  input: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt" | "deletedAt">>,
): Promise<Customer> {
  if (IS_MOCK) throw new Error("Not implemented in mock")
  return apiFetch<Customer>(`/customers/${id}`, { method: "PATCH", body: input })
}

/** Remove (soft-delete) um cliente. */
export async function deleteCustomer(id: string): Promise<void> {
  if (IS_MOCK) return
  return apiFetch<void>(`/customers/${id}`, { method: "DELETE" })
}

/** Listagem resumida — usada em selects e autocompletes. */
export async function listCustomerSummaries(): Promise<CustomerSummary[]> {
  if (IS_MOCK) {
    const list = await getMockCustomers()
    return list.map(({ id, name, phone, avatarUrl, status, lastAppointmentAt }) => ({
      id, name, phone, avatarUrl, status, lastAppointmentAt,
    }))
  }
  return apiFetch<CustomerSummary[]>("/customers/summaries")
}
