import { cn } from "@assistpro/ui"

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4.5">
        <path
          // d="M12 3.5 4.5 20h3.4l1.5-3.6h5.2L16.1 20h3.4L12 3.5Zm-1.4 9.6L12 9.4l1.4 3.7h-2.8Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

export function Logo({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="text-2xl font-bold tracking-tight text-foreground">floua</span>
      </div>
      {showTagline ? (
        <p className="text-xs text-muted-foreground">sua agenda, sua rotina, organizada.</p>
      ) : null}
    </div>
  )
}
