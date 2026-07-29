"use client"

import { customers } from "@/lib/mock/customers"
import type { CustomerStatus } from "@assistpro/types"
import { Avatar, cn, formatDate, formatPhone, Select } from "@assistpro/ui"
import { MoreVertical, Plus, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const statusFilters = [
  { value: "TODOS", label: "Todos" },
  { value: "ATIVO", label: "Ativos" },
  { value: "PENDENTE", label: "Pendentes" },
  { value: "INATIVO", label: "Inativos" },
] as const

const statusDotClasses: Record<CustomerStatus, string> = {
  ATIVO: "bg-success",
  PENDENTE: "bg-warning",
  INATIVO: "bg-muted-foreground",
}

const statusLabels: Record<CustomerStatus, string> = {
  ATIVO: "Ativo",
  PENDENTE: "Pendente",
  INATIVO: "Inativo",
}

export function CustomerList() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<(typeof statusFilters)[number]["value"]>("TODOS")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return customers.filter((customer) => {
      const matchesStatus = status === "TODOS" || customer.status === status
      const matchesQuery =
        normalized.length === 0 ||
        customer.name.toLowerCase().includes(normalized) ||
        customer.phone.includes(normalized.replace(/\D/g, ""))

      return matchesStatus && matchesQuery
    })
  }, [query, status])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente..."
            aria-label="Buscar cliente"
            className="w-full rounded-xl border border-input bg-card py-2.5 pr-3.5 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25 focus:outline-none"
          />
        </div>

        <Select
          value={status}
          aria-label="Filtrar por status"
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="sm:w-40"
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>

        <Link
          href="/clientes/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Novo cliente
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado para esta busca.
          </p>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((customer) => (
              <li key={customer.id} className="border-b border-border last:border-b-0">
                <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50">
                  <Link href={`/clientes/${customer.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={customer.name} src={customer.avatarUrl} />

                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-card-foreground">{customer.name}</span>
                        <span
                          className={cn("size-1.5 shrink-0 rounded-full", statusDotClasses[customer.status])}
                          aria-hidden="true"
                        />
                        <span className="sr-only">{statusLabels[customer.status]}</span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{formatPhone(customer.phone)}</span>
                      {customer.lastAppointmentAt ? (
                        <span className="truncate text-xs text-muted-foreground">
                          Último atendimento: {formatDate(customer.lastAppointmentAt)}
                        </span>
                      ) : null}
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <MoreVertical className="size-4" aria-hidden="true" />
                    <span className="sr-only">Ações para {customer.name}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
