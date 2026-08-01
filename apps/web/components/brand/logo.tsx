import { cn } from "@assistpro/ui"

/** Ícone "F" fluido da Floua — linhas em degradê roxo com dois pontos */
export function FlouaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="floua-grad" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* Ponto superior — cabeça */}
      <circle cx="18" cy="8" r="3.5" fill="url(#floua-grad)" />
      {/* Linha superior do F */}
      <path d="M14 14 Q10 16 10 20 Q10 24 16 24 L32 24 Q38 24 38 28 Q38 32 32 34" stroke="url(#floua-grad)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Linha do meio do F */}
      <path d="M16 24 Q12 25 12 29 Q12 33 18 33 L28 33" stroke="url(#floua-grad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Ponto inferior — velocidade */}
      <circle cx="30" cy="40" r="2.8" fill="url(#floua-grad)" />
    </svg>
  )
}

/** Logo completo: ícone + wordmark */
export function LogoFull({
  className,
  iconClassName,
  dark = false,
}: {
  className?: string
  iconClassName?: string
  dark?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <FlouaIcon className={iconClassName} />
      <span
        className={cn(
          "text-2xl font-bold tracking-tight",
          dark ? "text-white" : "text-foreground",
        )}
        style={{ fontVariantLigatures: "none" }}
      >
        floua
      </span>
    </div>
  )
}

/** Mantém retrocompatibilidade */
export function LogoMark({ className }: { className?: string }) {
  return <FlouaIcon className={className} />
}

export function Logo({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <LogoFull />
      {showTagline ? (
        <p className="text-xs text-muted-foreground">Menos tempo organizando. Mais tempo atendendo.</p>
      ) : null}
    </div>
  )
}
