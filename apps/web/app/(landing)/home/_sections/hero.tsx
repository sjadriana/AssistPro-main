"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Star } from "lucide-react"

const highlights = [
  "Agenda online com confirmação automática",
  "Cobrança via WhatsApp em 1 clique",
  "Sem contratos ou taxas escondidas",
]

const personas = [
  "Personal Trainers",
  "Professores de Tênis",
  "Fisioterapeutas",
  "Psicólogos",
  "Esteticistas",
  "Terapeutas",
  "Nutricionistas",
  "Professores de Natação",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background px-5 pb-20 pt-28 text-center">
      {/* Halo decorativo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          Assistente digital para profissionais autônomos
        </span>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
          Pare de perder tempo com{" "}
          <span className="text-primary">agenda e cobranças</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          O AssistPro cuida da sua agenda, envia lembretes automáticos pelo WhatsApp e cobra seus clientes — para você focar só nos atendimentos.
        </p>

        {/* Highlights */}
        <ul className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-sm text-foreground/70">
              <CheckCircle className="size-4 shrink-0 text-success-strong" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Começar grátis por 14 dias
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href="#precos"
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Ver planos e preços
          </a>
        </div>

        {/* Prova social inline */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1" aria-label="Avaliação 5 estrelas">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-warning-strong text-warning-strong" aria-hidden="true" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">+200 profissionais</span> já economizam tempo todo dia
          </p>
        </div>

        {/* Personas */}
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Feito para</p>
          <div className="flex flex-wrap justify-center gap-2">
            {personas.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
