import type { FinanceSummary } from "@assistpro/types"
import { cn, formatCurrency } from "@assistpro/ui"
import { ArrowDownRight, ArrowUpRight, ChevronDown, Clock, TrendingUp, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const tones = {
  neutral: "bg-secondary text-muted-foreground",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
} as const

/**
 * Cartão de total. Quando recebe `onClick` vira botão de verdade, para o card
 * "Pendente" poder abrir o painel de inadimplência sem perder acessibilidade.
 */
function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  children,
  onClick,
  expanded,
  controls,
}: {
  label: string
  value: number
  icon: LucideIcon
  tone: keyof typeof tones
  children?: React.ReactNode
  onClick?: () => void
  expanded?: boolean
  controls?: string
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>

      <span className="text-xl font-bold tracking-tight text-card-foreground tabular-nums">
        {formatCurrency(value)}
      </span>

      {children}
    </>
  )

  const baseClass = "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"

  if (!onClick) return <div className={baseClass}>{content}</div>

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      className={cn(
        baseClass,
        "text-left transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
      )}
    >
      {content}
    </button>
  )
}

export function FinanceSummaryCards({
  summary,
  openCount,
  overdueExpanded,
  onToggleOverdue,
}: {
  summary: FinanceSummary
  /** Quantos clientes estão com valores em aberto, incluindo períodos anteriores. */
  openCount: number
  overdueExpanded: boolean
  onToggleOverdue: () => void
}) {
  const { changeVsPreviousPeriod: change } = summary
  const isPositive = change >= 0
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard label="Previsto" value={summary.expected} icon={TrendingUp} tone="neutral" />

      <SummaryCard label="Recebido" value={summary.received} icon={Wallet} tone="success">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold",
            isPositive ? "text-success-strong" : "text-danger-strong",
          )}
        >
          <ChangeIcon className="size-3.5" aria-hidden="true" />
          {Math.abs(change)}%
          <span className="font-normal text-muted-foreground">vs. período anterior</span>
        </span>
      </SummaryCard>

      <SummaryCard
        label="Pendente"
        value={summary.pending}
        icon={Clock}
        tone="warning"
        onClick={onToggleOverdue}
        expanded={overdueExpanded}
        controls="painel-inadimplencia"
      >
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-strong">
          {openCount > 0 ? (
            <>
              {openCount} {openCount === 1 ? "cliente em aberto" : "clientes em aberto"}
              <ChevronDown
                className={cn("size-3.5 transition-transform", overdueExpanded && "rotate-180")}
                aria-hidden="true"
              />
            </>
          ) : (
            <span className="font-normal text-muted-foreground">Ninguém em aberto</span>
          )}
        </span>
      </SummaryCard>
    </div>
  )
}
