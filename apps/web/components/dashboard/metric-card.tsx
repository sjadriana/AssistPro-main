import { cn } from "@assistpro/ui"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const tones = {
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger-strong",
  neutral: "bg-secondary text-muted-foreground",
} as const

export function MetricCard({
  value,
  label,
  icon: Icon,
  tone,
  action,
}: {
  value: number | string
  label: string
  icon: LucideIcon
  tone: keyof typeof tones
  action: { label: string; href: string }
}) {
  return (
    <Link
      href={action.href}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between">
        <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold tracking-tight text-card-foreground">{value}</span>
        <span className="text-xs font-medium leading-relaxed text-foreground/70">{label}</span>
      </div>
    </Link>
  )
}
