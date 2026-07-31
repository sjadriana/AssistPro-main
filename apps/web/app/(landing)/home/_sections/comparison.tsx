import { X, Check } from "lucide-react"

const rows = [
  {
    topic: "Confirmação de agendamentos",
    before: "Você confirma um a um no WhatsApp",
    after: "Confirmação automática no momento do agendamento",
  },
  {
    topic: "Lembretes de consultas",
    before: "Você lembra na hora ou o cliente falta",
    after: "Lembrete automático 24h e 30min antes",
  },
  {
    topic: "Cobrança",
    before: "Você cobra na hora e espera o Pix chegar",
    after: "Link de pagamento enviado automaticamente pelo WhatsApp",
  },
  {
    topic: "Inadimplência",
    before: "Você não sabe quem está devendo",
    after: "Dashboard com lista de devedores e alertas automáticos",
  },
  {
    topic: "Alunos de grades fixas",
    before: "Planilha ou caderno com controle manual",
    after: "Grade fixa com lembrete semanal automático para cada aluno",
  },
  {
    topic: "Agendamentos em grupo",
    before: "Grupo de WhatsApp e controle manual de vagas",
    after: "Inscrições online com controle de vagas e lista de espera",
  },
  {
    topic: "Cancelamentos",
    before: "Você descobre quando o cliente some",
    after: "Cliente cancela pelo link e você recebe notificação imediata",
  },
  {
    topic: "Nota fiscal",
    before: "Você emite manualmente ou não emite",
    after: "NFS-e emitida e enviada automaticamente após o pagamento",
  },
]

export function Comparison() {
  return (
    <section className="bg-background px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Por que o AssistPro?</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Chega de fazer no braço o que pode ser automático
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Veja como o dia a dia muda quando a burocracia sai do seu caminho.
          </p>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="mb-2 grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>O que fazer</span>
          <span className="text-center text-danger-strong">Sem AssistPro</span>
          <span className="text-center text-success-strong">Com AssistPro</span>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div
              key={row.topic}
              className="grid grid-cols-[1fr_1fr_1fr] gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
            >
              <p className="text-sm font-medium text-foreground">{row.topic}</p>

              <div className="flex items-start gap-2">
                <X className="mt-0.5 size-4 shrink-0 text-danger-strong" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">{row.before}</p>
              </div>

              <div className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success-strong" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-foreground/80">{row.after}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
