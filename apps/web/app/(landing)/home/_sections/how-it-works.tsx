import { UserPlus, Sliders, Zap, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crie sua conta",
    description: "Cadastro em menos de 2 minutos. Sem cartão de crédito. Sem configurações técnicas complicadas.",
  },
  {
    icon: Sliders,
    step: "02",
    title: "Configure sua agenda",
    description: "Informe seus horários de atendimento, serviços oferecidos e conecte seu WhatsApp. Pronto.",
  },
  {
    icon: Zap,
    step: "03",
    title: "A assistente assume",
    description: "Confirmações, lembretes, cobranças e reagendamentos passam a ser enviados automaticamente para seus clientes.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Você foca no que importa",
    description: "Com as tarefas administrativas automatizadas, você tem mais tempo para atender, aprimorar sua técnica e crescer.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-secondary/40 px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Como funciona</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Comece a usar em menos de 5 minutos
          </h2>
        </div>

        <div className="relative">
          {/* Linha conectora — visível apenas em desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[22px] top-10 hidden h-[calc(100%-5rem)] w-px bg-border sm:block"
          />

          <div className="flex flex-col gap-6">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="flex gap-5 rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{step.step}</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
