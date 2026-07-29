import { assistantEvents, mockNow } from "@/lib/mock/assistant"
import type { AssistantEventKind } from "@assistpro/types"
import { Card, CardBody, CardHeader, cn, formatRelative } from "@assistpro/ui"
import { AlertCircle, CalendarClock, CheckCircle2, Clock, UserMinus, Wallet, Send, CalendarPlus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

/** Ícones usados nos botões de ação sugerida. */
const actionIconMap: Record<string, LucideIcon> = {
  "Enviar cobrança": Send,
  "Oferecer horário": CalendarPlus,
  "Remarcar": CalendarClock,
}

const eventVisuals: Record<AssistantEventKind, { icon: LucideIcon; tone: string }> = {
  CONFIRMACAO_RECEBIDA: { icon: CheckCircle2, tone: "bg-success-soft text-success-strong" },
  CANCELAMENTO: { icon: AlertCircle, tone: "bg-danger-soft text-danger-strong" },
  PAGAMENTO_PENDENTE: { icon: Wallet, tone: "bg-warning-soft text-warning-strong" },
  REAGENDAMENTO_SOLICITADO: { icon: CalendarClock, tone: "bg-warning-soft text-warning-strong" },
  CLIENTE_INATIVO: { icon: UserMinus, tone: "bg-secondary text-muted-foreground" },
  RETORNO_SUGERIDO: { icon: Clock, tone: "bg-primary-soft text-primary" },
}

export function AssistantFeed() {
  return (
    <Card>
      <CardHeader
        title="Sua Assistente informa"
        action={
          <Link
            href="/comunicacoes"
            className="text-xs font-semibold text-primary transition-opacity hover:opacity-70"
          >
            Ver todas
          </Link>
        }
      />

      <CardBody className="p-0">
        <ul className="flex flex-col">
          {assistantEvents.map((event) => {
            const { icon: Icon, tone } = eventVisuals[event.kind]

            return (
              <li key={event.id} className="border-b border-border last:border-b-0">
                <div className="flex items-start gap-3 px-5 py-3.5">
                  <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg", tone)}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-relaxed text-card-foreground">{event.message}</p>
                      <span className="shrink-0 pt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                        {formatRelative(event.createdAt, mockNow)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-col gap-2">
                      {event.detail ? <span className="text-xs text-muted-foreground">{event.detail}</span> : null}
                      {event.suggestedAction ? (() => {
                        const ActionIcon = actionIconMap[event.suggestedAction.label] ?? CalendarClock
                        return (
                          <Link
                            href={event.suggestedAction.href}
                            className="mt-0.5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-all hover:border-primary/50 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                          >
                            <ActionIcon className="size-4 shrink-0" aria-hidden="true" />
                            {event.suggestedAction.label}
                          </Link>
                        )
                      })() : null}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>


      </CardBody>
    </Card>
  )
}
