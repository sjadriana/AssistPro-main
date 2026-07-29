import type * as React from "react"
import { cn } from "../lib/cn"

/**
 * Interruptor acessível para ligar e desligar automações.
 * Usa um input checkbox real para manter navegação por teclado e leitores de tela.
 * Trilho e marcador são irmãos do input porque `peer-*` só alcança irmãos.
 */
export function Switch({
  label,
  hideLabel = false,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: string; hideLabel?: boolean }) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5", className)}>
      <span className="relative inline-flex shrink-0 items-center">
        <input type="checkbox" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-9 items-center rounded-full bg-input transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-disabled:opacity-50"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 size-4 rounded-full bg-card shadow-sm transition-transform peer-checked:translate-x-4"
        />
      </span>
      <span className={cn("text-sm text-foreground", hideLabel && "sr-only")}>{label}</span>
    </label>
  )
}
