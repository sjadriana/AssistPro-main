"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@assistpro/ui"

const faqs = [
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. O AssistPro é 100% web — você acessa pelo navegador de qualquer dispositivo. Seus clientes também não precisam instalar nada; tudo acontece pelo WhatsApp deles.",
  },
  {
    q: "Como funciona o período de teste gratuito?",
    a: "Você tem 14 dias de acesso completo a todas as funcionalidades sem precisar cadastrar cartão de crédito. Ao final do período, escolhe o plano que prefere ou cancela sem custo.",
  },
  {
    q: "O sistema funciona para qualquer tipo de profissional autônomo?",
    a: "Sim. A plataforma foi pensada para qualquer profissional que trabalha com atendimentos individuais: personal trainers, professores particulares, esteticistas, terapeutas, nutricionistas, consultores e similares.",
  },
  {
    q: "Como é feita a integração com WhatsApp?",
    a: "Utilizamos a API oficial do WhatsApp. Você conecta seu número durante a configuração inicial e a plataforma passa a enviar mensagens em seu nome — confirmações, lembretes e cobranças.",
  },
  {
    q: "A emissão de nota fiscal é obrigatória?",
    a: "Não. O módulo de NFS-e é opcional e aparece apenas para profissionais com CNPJ. Quem trabalha como pessoa física (CPF) não vê essa opção, sem nenhuma configuração necessária.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Não há contratos de fidelidade nem multas por cancelamento. Você cancela quando quiser e seus dados ficam disponíveis para exportação por 30 dias após o cancelamento.",
  },
  {
    q: "O AssistPro substitui minha agenda do Google ou iCloud?",
    a: "O AssistPro é uma agenda completa com foco em automação e financeiro. Não depende de outras agendas para funcionar, mas estamos desenvolvendo integrações com Google Calendar para sincronização.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-background px-5 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Dúvidas frequentes</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {open === i ? (
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
