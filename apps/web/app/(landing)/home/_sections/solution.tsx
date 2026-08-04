import { Sparkles } from "lucide-react"

export function Solution() {
  return (
    <section className="bg-primary px-5 py-20 text-primary-foreground">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="size-3.5" aria-hidden="true" />
          A solução
        </span>
        <h2 className="text-balance text-3xl font-bold sm:text-4xl">
          Menos tempo organizando <span className="text-primary-foreground">Mais tempo atendendo</span>
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-primary-foreground/80">
          Floua é uma plataforma que conecta sua agenda, seus clientes e seu financeiro num único lugar, automatiza tudo pelo WhatsApp, o canal onde seus clientes já estão. Nada de apps novos para instalar, nada de treinamentos complexos.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { number: "2h", label: "economizadas por dia em média" },
            { number: "0", label: "faltas com lembretes automáticos" },
            { number: "38%", label: "de desconto no plano anual" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-5 py-6 text-center"
            >
              <div className="text-3xl font-extrabold">{stat.number}</div>
              <div className="mt-1 text-xs leading-relaxed text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
