import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Camila Rocha",
    role: "Personal Trainer — São Paulo, SP",
    avatar: "CR",
    stars: 5,
    text: "Antes eu passava quase 2 horas por dia respondendo WhatsApp e confirmando treinos. Hoje o AssistPro faz tudo isso sozinho. Recuperei tempo que eu usava para atender mais clientes.",
  },
  {
    name: "Rafael Mendes",
    role: "Professor de Tênis — Campinas, SP",
    avatar: "RM",
    stars: 5,
    text: "O que me convenceu foi a grade fixa. Meus alunos de mensalidade recebem lembrete automático toda semana sem eu precisar fazer nada. Inadimplência caiu muito.",
  },
  {
    name: "Fernanda Lima",
    role: "Fisioterapeuta — Belo Horizonte, MG",
    avatar: "FL",
    stars: 5,
    text: "Finalmente uma plataforma que não pede para o paciente baixar app. Ele agenda pelo link, confirma pelo WhatsApp e eu recebo tudo organizado. Simples assim.",
  },
  {
    name: "Bruno Alves",
    role: "Psicólogo — Rio de Janeiro, RJ",
    avatar: "BA",
    stars: 5,
    text: "A cobrança automática via Pix mudou minha relação com o financeiro. Não preciso mais cobrar ninguém de forma constrangedora — o sistema faz isso com uma mensagem profissional.",
  },
  {
    name: "Ana Paula Costa",
    role: "Nutricionista — Florianópolis, SC",
    avatar: "AC",
    stars: 5,
    text: "Configurei em menos de 10 minutos. Na mesma tarde já tinha meu link de agendamento funcionando. O suporte via WhatsApp é rápido e prestativo.",
  },
  {
    name: "Thiago Santos",
    role: "Massagista Terapêutico — Curitiba, PR",
    avatar: "TS",
    stars: 5,
    text: "Testei outros sistemas e todos eram complicados demais. O AssistPro é direto ao ponto. Agenda, cobra, lembra — sem burocracia.",
  },
]

export function Testimonials() {
  return (
    <section className="bg-background px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Depoimentos</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Profissionais que recuperaram o controle da agenda
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Mais de 200 profissionais autônomos já usam o AssistPro para automatizar o dia a dia.
          </p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="mb-4 break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              {/* Estrelas */}
              <div className="mb-3 flex items-center gap-0.5" aria-label={`${t.stars} estrelas`}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-warning-strong text-warning-strong" aria-hidden="true" />
                ))}
              </div>

              {/* Texto */}
              <p className="text-sm leading-relaxed text-foreground/80">{`"${t.text}"`}</p>

              {/* Autor */}
              <div className="mt-4 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
