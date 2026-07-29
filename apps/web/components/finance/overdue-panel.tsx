"use client"

import { daysLate } from "@/lib/finance"
import type { Charge, OpenCustomerBalance } from "@assistpro/types"
import { Avatar, Badge, Card, CardHeader, cn, formatCurrency, formatDate, PaymentBadge } from "@assistpro/ui"
import { ChevronDown, MessageCircle, User, Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"

/** Etiqueta de atraso: vermelha quando venceu, âmbar quando ainda vai vencer. */
function LateBadge({ days }: { days: number }) {
  if (days <= 0) return <Badge tone="warning">A vencer</Badge>

  return <Badge tone="danger">{days === 1 ? "1 dia de atraso" : `${days} dias de atraso`}</Badge>
}

function CustomerRow({
  balance,
  onChargeWhatsApp,
  onRegisterPayment,
}: {
  balance: OpenCustomerBalance
  onChargeWhatsApp: (balance: OpenCustomerBalance) => void
  onRegisterPayment: (charge: Charge) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const panelId = `overdue-${balance.customerId}`

  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex flex-col gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="-mx-1 flex items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <Avatar name={balance.customerName} className="shrink-0" />

          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-card-foreground">{balance.customerName}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <LateBadge days={balance.daysLate} />
              <span className="text-xs text-muted-foreground">
                {balance.charges.length === 1 ? "1 cobrança" : `${balance.charges.length} cobranças`}
              </span>
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-bold text-card-foreground tabular-nums">
              {formatCurrency(balance.totalOpen)}
            </span>
            <ChevronDown
              className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </span>
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChargeWhatsApp(balance)}
            className={`${actionButtonClass} bg-success-soft text-success-strong hover:opacity-80`}
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            Cobrar no WhatsApp
            <span className="sr-only">de {balance.customerName}</span>
          </button>

          <Link
            href={`/clientes/${balance.customerId}`}
            className={`${actionButtonClass} bg-secondary text-muted-foreground hover:opacity-80`}
          >
            <User className="size-3.5" aria-hidden="true" />
            Ver cliente
            <span className="sr-only">{balance.customerName}</span>
          </Link>
        </div>

        {expanded ? (
          <ul id={panelId} className="flex flex-col gap-2 border-t border-border pt-3">
            {balance.charges.map((charge) => (
              <li key={charge.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-xs font-medium text-card-foreground">{charge.description}</span>
                  <span className="text-xs text-muted-foreground">
                    Venceu em {formatDate(charge.dueDate)}
                    {daysLate(charge.dueDate) > 0 ? ` · ${daysLate(charge.dueDate)}d` : ""}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-bold text-card-foreground tabular-nums">
                    {formatCurrency(charge.amount)}
                  </span>
                  <PaymentBadge status={charge.status} />
                  <button
                    type="button"
                    onClick={() => onRegisterPayment(charge)}
                    className={`${actionButtonClass} bg-primary-soft text-accent-foreground hover:opacity-80`}
                  >
                    <Wallet className="size-3.5" aria-hidden="true" />
                    Registrar
                    <span className="sr-only">
                      pagamento de {charge.description} de {balance.customerName}
                    </span>
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  )
}

/**
 * Painel de quem está devendo, agrupado por cliente.
 *
 * Recebe saldos calculados sobre TODAS as cobranças, não só as do período
 * filtrado: uma dívida de março precisa aparecer mesmo com o filtro em maio.
 */
export function OverduePanel({
  id,
  balances,
  onChargeWhatsApp,
  onChargeAllWhatsApp,
  onRegisterPayment,
}: {
  id: string
  balances: OpenCustomerBalance[]
  onChargeWhatsApp: (balance: OpenCustomerBalance) => void
  onChargeAllWhatsApp: () => void
  onRegisterPayment: (charge: Charge) => void
}) {
  const total = balances.reduce((sum, balance) => sum + balance.totalOpen, 0)
  const overdueCount = balances.filter((balance) => balance.daysLate > 0).length

  return (
    <div id={id}>
      <Card>
        <CardHeader
          title="Pagamentos em aberto"
          action={
            balances.length > 0 ? (
              <button
                type="button"
                onClick={onChargeAllWhatsApp}
                className={`${actionButtonClass} bg-success-soft text-success-strong hover:opacity-80`}
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                Cobrar todos
              </button>
            ) : undefined
          }
        />

        {balances.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum pagamento em aberto. Todos os clientes estão em dia.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-secondary px-4 py-2.5">
              <span className="text-xs text-muted-foreground">
                Total em aberto{" "}
                <strong className="font-bold text-foreground tabular-nums">{formatCurrency(total)}</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                {balances.length === 1 ? "1 cliente" : `${balances.length} clientes`}
                {overdueCount > 0 ? ` · ${overdueCount} em atraso` : ""}
              </span>
            </div>

            <ul className="flex flex-col">
              {balances.map((balance) => (
                <CustomerRow
                  key={balance.customerId}
                  balance={balance}
                  onChargeWhatsApp={onChargeWhatsApp}
                  onRegisterPayment={onRegisterPayment}
                />
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}
