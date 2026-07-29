import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="bg-primary px-5 py-20 text-center text-primary-foreground">
      <div className="mx-auto max-w-xl">
        <h2 className="text-balance text-3xl font-bold sm:text-4xl">
          Pronto para recuperar seu tempo?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-primary-foreground/80">
          Comece grátis por 14 dias. Sem cartão de crédito. Configure em menos de 5 minutos e veja a diferença ainda hoje.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-foreground px-7 py-3.5 text-sm font-bold text-primary shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
          >
            Começar grátis agora
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href="#precos"
            className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
          >
            Ver planos e preços
          </a>
        </div>
      </div>
    </section>
  )
}
