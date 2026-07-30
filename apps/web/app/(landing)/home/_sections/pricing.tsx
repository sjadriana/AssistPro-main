"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@assistpro/ui"

const plans = [
  {
    id: "mensal",
    label: "Mensal",
    monthlyPrice: 129.9,
    billedAs: null,
    discount: null,
    badge: null,
  },
  {
    id: "trimestral",
    label: "Trimestral",
    monthlyPrice: 114.9,
    billedAs: "R$ 344,70 a cada 3 meses",
    discount: "~11% off",
    badge: null,
  },
  {
    id: "semestral",
    label: "Semestral",
    monthlyPrice: 99.9,
    billedAs: "R$ 599,40 a cada 6 meses",
    discount: "~23% off",
    badge: "Popular",
  },
  {
    id: "anual",
    label: "Anual",
    monthlyPrice: 79.9,
    billedAs: "R$ 958,80 por ano",
    discount: "~38% off",
    badge: "Melhor valor",
  },
]

const includedFeatures = [
  "Agenda com visão dia, semana e mês",
  "Lembretes automáticos pelo WhatsApp",
  "Confirmação e reagendamento automáticos",
  "Cobrança automática via Pix, Boleto e Cartão",
  "CRM de clientes com histórico completo",
  "Dashboard com feed de assistente inteligente",
  "Bloqueio de horários e gestão de disponibilidade",
  "Relatórios financeiros e taxa de cancelamento",
  "Emissão de NFS-e para CNPJ (opcional)",
  "Suporte via WhatsApp",
]

export function Pricing() {
  const [selected, setSelected] = useState<string>("semestral")
  const current = plans.find((p) => p.id === selected)!

  return (
    <section id="precos" className="bg-secondary/40 px-5 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Preços</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Um único plano. Sem surpresas.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground">
            Acesso completo a todas as funcionalidades. Escolha apenas o período de cobrança que faz mais sentido para você.
          </p>
        </div>

        {/* Seletor de período */}
        <div className="mb-6 flex  rounded-2xl border border-border bg-card shadow-xs">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                selected === plan.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {plan.badge ? (
                <span
                  className={cn(
                    "absolute -top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    selected === plan.id
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {plan.badge}
                </span>
              ) : null}
              <span>{plan.label}</span>
              {plan.discount ? (
                <span className={cn("text-[10px]", selected === plan.id ? "text-primary-foreground/70" : "text-success-strong")}>
                  {plan.discount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Card de preço */}
        <div className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-md">
          <div className="border-b border-border bg-primary/5 px-6 py-6 text-center">
            <div className="flex items-end justify-center gap-1">
              <span className="text-lg font-semibold text-muted-foreground">R$</span>
              <span className="text-5xl font-extrabold text-foreground">
                {current.monthlyPrice.toFixed(2).replace(".", ",")}
              </span>
              <span className="mb-1 text-base text-muted-foreground">/mês</span>
            </div>
            {current.billedAs ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Cobrado como {current.billedAs}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">Cobrado mensalmente</p>
            )}
            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Começar grátis por 14 dias
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Sem cartão de crédito para começar
            </p>
          </div>

          {/* Funcionalidades incluídas */}
          <ul className="grid gap-3 px-6 py-6 sm:grid-cols-2">
            {includedFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-strong" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Cancele quando quiser, sem multas. Dados exportáveis a qualquer momento.
        </p>
      </div>
    </section>
  )
}
