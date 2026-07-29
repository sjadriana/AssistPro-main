import type { ReactNode } from "react"
import { cn } from "../lib/cn"

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-2xl border border-border bg-card shadow-xs", className)}>{children}</section>
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  /** Linha de apoio opcional, para explicar o que a seção faz. */
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex justify-between gap-3 border-b border-border px-5 py-4",
        description ? "items-start" : "items-center",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
        {description ? <p className="text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>
}
