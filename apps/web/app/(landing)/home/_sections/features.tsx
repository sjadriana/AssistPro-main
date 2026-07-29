import {
  CalendarCheck2,
  MessageCircle,
  Receipt,
  LayoutDashboard,
  Users,
  FileText,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    tone: "bg-primary/10 text-primary",
    title: "Dashboard inteligente",
    description:
      "Painel central com atendimentos do dia, confirmações pendentes, pagamentos em aberto e horários livres — tudo em uma tela, com ações de 1 clique.",
  },
  {
    icon: CalendarCheck2,
    tone: "bg-success-soft text-success-strong",
    title: "Agenda com lembretes automáticos",
    description:
      "Clientes recebem confirmação pelo WhatsApp no momento do agendamento, 24h antes e 30 minutos antes. Sem mais faltas por esquecimento.",
  },
  {
    icon: MessageCircle,
    tone: "bg-success-soft text-success-strong",
    title: "Automação pelo WhatsApp",
    description:
      "A plataforma envia mensagens de confirmação, lembrete, cobrança e reagendamento automaticamente — no canal onde seus clientes já estão.",
  },
  {
    icon: Receipt,
    tone: "bg-warning-soft text-warning-strong",
    title: "Cobrança automática via Asaas",
    description:
      "Gere links de pagamento por Pix, boleto ou cartão e envie direto pelo WhatsApp. O sistema monitora inadimplência e avisa sobre atrasos.",
  },
  {
    icon: Users,
    tone: "bg-primary/10 text-primary",
    title: "CRM leve de clientes",
    description:
      "Histórico completo de cada cliente: contato, status de adimplência, último atendimento e recorrência de agendamentos.",
  },
  {
    icon: FileText,
    tone: "bg-warning-soft text-warning-strong",
    title: "Nota fiscal automática (NFS-e)",
    description:
      "Para profissionais com CNPJ, emita e envie a nota fiscal automaticamente após a confirmação do pagamento. Para CPF, o recurso fica oculto sem gerar atrito.",
  },
]

export function Features() {
  return (
    <section id="funcionalidades" className="bg-background px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Funcionalidades</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Tudo que você precisa para gerir seus atendimentos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Uma plataforma completa pensada para profissionais autônomos — sem curva de aprendizado, sem complexidade desnecessária.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <span className={`inline-flex size-10 items-center justify-center rounded-xl ${feature.tone}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
