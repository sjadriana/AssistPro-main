import { MessageCircleWarning, CalendarX2, BanknoteX, AppWindow } from "lucide-react"

const problems = [
  {
    icon: MessageCircleWarning,
    title: "Horas perdidas no WhatsApp",
    description:
      "Responder mensagens repetitivas, confirmar horários manualmente e reorganizar a agenda consome horas do seu dia que poderiam ser usadas em atendimentos.",
  },
  {
    icon: CalendarX2,
    title: "Faltas e esquecimentos",
    description:
      "Clientes que agendam e simplesmente não aparecem — sem aviso, sem cancelamento. Cada falta é dinheiro jogado fora e um horário desperdiçado.",
  },
  {
    icon: BanknoteX,
    title: "Cobranças constrangedoras",
    description:
      "Pedir pagamento a clientes é desconfortável. O resultado é inadimplência acumulada, faturamento imprevisível e relacionamentos desgastados.",
  },
  {
    icon: AppWindow,
    title: "Sistemas complexos demais",
    description:
      "Softwares que exigem que o cliente baixe apps, cadastros demorados ou interfaces pensadas para empresas — não para você, profissional autônomo.",
  },
]

export function Problems() {
  return (
    <section className="bg-secondary/40 px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">O problema</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Você é bom no que faz. A burocracia é que atrapalha.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Profissionais autônomos perdem em média 2 horas por dia em tarefas administrativas que poderiam ser automatizadas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {problems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs"
              >
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger-strong">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
