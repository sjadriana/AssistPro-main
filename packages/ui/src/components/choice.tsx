import type * as React from "react"
import { cn } from "../lib/cn"

/** Caixa de seleção com rótulo, usada em lembretes e confirmações. */
export function Checkbox({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-foreground", className)}>
      <span className="relative inline-flex shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer size-4 cursor-pointer appearance-none rounded border border-input bg-card transition-colors checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          {...props}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute size-3 text-primary-foreground opacity-0 peer-checked:opacity-100"
        >
          <path d="M3 8.5l3.5 3.5L13 4.5" />
        </svg>
      </span>
      {label}
    </label>
  )
}

/** Opção de rádio em formato de cartão, usada no tipo de atendimento. */
export function RadioCard({
  label,
  icon,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: string; icon?: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors has-checked:border-primary has-checked:bg-primary-soft has-checked:text-accent-foreground hover:bg-secondary",
        className,
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      {icon}
      {label}
    </label>
  )
}
