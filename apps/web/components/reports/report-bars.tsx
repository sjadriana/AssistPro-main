import type { ReportBar } from "@/lib/reports"
import { formatCurrency } from "@assistpro/ui"

/**
 * Lista de barras horizontais. Escolhida em vez de um gráfico canvas porque
 * lê bem em tela de celular e continua acessível: cada linha é rótulo + valor.
 */
export function ReportBars({
  bars,
  format = "currency",
  emptyMessage = "Sem dados no período.",
}: {
  bars: ReportBar[]
  format?: "currency" | "count"
  emptyMessage?: string
}) {
  if (bars.length === 0) {
    return <p className="px-1 py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {bars.map((bar) => (
        <li key={bar.key} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-foreground">{bar.label}</span>
            <span className="shrink-0 text-sm font-semibold text-card-foreground tabular-nums">
              {format === "currency" ? formatCurrency(bar.value) : bar.value}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.max(bar.ratio * 100, bar.value > 0 ? 4 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
