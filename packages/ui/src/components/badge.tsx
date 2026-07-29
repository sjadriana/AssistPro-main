import type * as React from "react"
import { cn } from "../lib/cn"

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger"

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-accent-foreground",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger-strong",
}

/** Etiqueta genérica para origem de cobrança, status de mensagem e de atendimento. */
export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: BadgeTone; icon?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
