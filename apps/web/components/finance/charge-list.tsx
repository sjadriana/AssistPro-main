"use client"

import { billingTypeLabels } from "@/lib/asaas"
import { chargeOriginLabel } from "@/lib/finance"
import type { Charge, FinanceFilters, FinancePeriod, PaymentStatus } from "@assistpro/types"
import { Badge, Card, CardHeader, formatCurrency, formatDate, PaymentBadge, Select } from "@assistpro/ui"
import { MessageCircle, Plus, QrCode, Wallet } from "lucide-react"

const periodOptions: { value: FinancePeriod; label: string }[] = [
  { value: "ESTE_MES", label: "Este mês" },
  { value: "MES_PASSADO", label: "Mês passado" },
  { value: "ULTIMOS_7_DIAS", label: "Últimos 7 dias" },
]

const statusOptions: { value: PaymentStatus | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Pendentes" },
  { value: "ATRASADO", label: "Atrasados" },
  { value: "PAGO", label: "Pagos" },
  { value: "CANCELADO", label: "Cancelados" },
]

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"

export function ChargeList({
  charges,
  filters,
  onFiltersChange,
  onRegisterPayment,
  onChargePix,
  onNewCharge,
  onSendWhatsApp,
}: {
  charges: Charge[]
  filters: FinanceFilters
  onFiltersChange: (filters: FinanceFilters) => void
  onRegisterPayment: (charge: Charge) => void
  onChargePix: (charge: Charge) => void
  onNewCharge: () => void
  onSendWhatsApp: (charge: Charge) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={filters.period}
          aria-label="Filtrar por período"
          onChange={(event) => onFiltersChange({ ...filters, period: event.target.value as FinancePeriod })}
          className="sm:w-44"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={filters.status}
          aria-label="Filtrar por status do pagamento"
          onChange={(event) =>
            onFiltersChange({ ...filters, status: event.target.value as FinanceFilters["status"] })
          }
          className="sm:w-40"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <button
          type="button"
          onClick={onNewCharge}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none sm:ml-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nova cobrança
        </button>
      </div>

      <Card>
        <CardHeader title="Cobranças" action={<span className="text-xs text-muted-foreground">{charges.length}</span>} />

        {charges.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhuma cobrança encontrada para este filtro.
          </p>
        ) : (
          <ul className="flex flex-col">
            {charges.map((charge) => {
              const isOpen = charge.status === "PENDENTE" || charge.status === "ATRASADO"

              return (
                <li key={charge.id} className="border-b border-border last:border-b-0">
                  <div className="flex flex-col gap-3 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold text-card-foreground">
                          {charge.customerName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{charge.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {charge.status === "PAGO" && charge.paidAt
                            ? `Pago em ${formatDate(charge.paidAt)}`
                            : `Vence em ${formatDate(charge.dueDate)}`}
                        </span>

                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge tone={charge.origin === "ATENDIMENTO" ? "primary" : "neutral"}>
                            {chargeOriginLabel(charge)}
                          </Badge>
                          {charge.billingType ? (
                            <span className="text-xs text-muted-foreground">
                              {billingTypeLabels[charge.billingType]}
                            </span>
                          ) : null}
                        </span>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="text-sm font-bold text-card-foreground tabular-nums">
                          {formatCurrency(charge.amount)}
                        </span>
                        <PaymentBadge status={charge.status} />
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onRegisterPayment(charge)}
                          className={`${actionButtonClass} bg-success-soft text-success-strong hover:opacity-80`}
                        >
                          <Wallet className="size-3.5" aria-hidden="true" />
                          Registrar pagamento
                          <span className="sr-only">de {charge.customerName}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onChargePix(charge)}
                          className={`${actionButtonClass} bg-primary-soft text-accent-foreground hover:opacity-80`}
                        >
                          <QrCode className="size-3.5" aria-hidden="true" />
                          Cobrar via PIX
                          <span className="sr-only">de {charge.customerName}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSendWhatsApp(charge)}
                          className={`${actionButtonClass} bg-secondary text-muted-foreground hover:opacity-80`}
                        >
                          <MessageCircle className="size-3.5" aria-hidden="true" />
                          WhatsApp
                          <span className="sr-only">cobrar {charge.customerName}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
