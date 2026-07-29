import { Target, Eye, Handshake } from "lucide-react"

const pillars = [
  {
    icon: Target,
    label: "Missão",
    text: "Devolver tempo para profissionais de atendimento, eliminando tarefas administrativas manuais e garantindo a saúde financeira de seus negócios.",
  },
  {
    icon: Eye,
    label: "Visão",
    text: "Ser um SaaS enxuto, escalável e administrável de qualquer lugar do mundo, gerando receita recorrente previsível e independência financeira para cada profissional que usamos.",
  },
  {
    icon: Handshake,
    label: "Valores",
    text: "Simplicidade acima de complexidade. Autonomia acima de dependência. Resultado acima de funcionalidade. Construímos para o profissional real — não para o perfil imaginado.",
  },
]

export function Mission() {
  return (
    <section id="sobre" className="bg-background px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Quem somos</p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Construído por quem entende o dia a dia de quem atende
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Não somos uma grande empresa de software genérico. Somos uma plataforma especializada, desenvolvida especificamente para profissionais autônomos — personal trainers, esteticistas, terapeutas, consultores — que vivem de atendimentos e precisam de tempo para crescer.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.label}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-xs"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{pillar.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Para quem é */}
        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">Para quem é o AssistPro</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Personal trainers e professores de educação física",
              "Esteticistas e profissionais de beleza",
              "Terapeutas e psicólogos",
              "Nutricionistas e consultores de saúde",
              "Professores particulares e tutores",
              "Qualquer profissional que vive de atendimentos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
