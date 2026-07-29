"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { nextBillingDay } from "@/lib/finance"
import { templateById } from "@/lib/mock/messaging"
import { whatsappIsMocked } from "@/lib/whatsapp"
import type { Automation, BillingRunRecipient } from "@assistpro/types"
import { Badge, Card, CardHeader, formatCurrency, formatDate, formatPhone, Switch } from "@assistpro/ui"
import { CalendarClock, Eye, Info, Send } from "lucide-react"
import { useState } from "react"

/**
 * Automações de mensagem. A régua de cobrança do dia 30 ganha destaque porque é
 * a que move dinheiro: mostra quantos alunos serão cobrados e permite revisar a
 * lista antes do disparo.
 */
export function AutomationsTab({
  automations,
  billingRecipients,
  onToggle,
  onSendNow,
}: {
  automations: Automation[]
  billingRecipients: BillingRunRecipient[]
  onToggle: (id: string, enabled: boolean) => void
  onSendNow: () => void
}) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const billingTotal = billingRecipients.reduce((sum, recipient) => sum + recipient.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader title="Régua de cobrança" />

        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary" icon={<CalendarClock className="size-3" aria-hidden="true" />}>
              Próximo envio em {formatDate(nextBillingDay())}
            </Badge>
            <Badge tone="neutral">
              {billingRecipients.length === 1 ? "1 aluno" : `${billingRecipients.length} alunos`}
            </Badge>
            <Badge tone="warning">{formatCurrency(billingTotal)}</Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Todo dia 30, cada aluno com valor em aberto recebe uma mensagem no WhatsApp com o total e o link de
            pagamento. Quem tem mais de uma parcela em aberto recebe uma única mensagem consolidada.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className={`${dialogButtonClass.secondary} sm:w-auto`}
            >
              <Eye className="size-4" aria-hidden="true" />
              Ver destinatários
            </button>

            <button
              type="button"
              onClick={onSendNow}
              disabled={billingRecipients.length === 0}
              className={`${dialogButtonClass.primary} sm:w-auto`}
            >
              <Send className="size-4" aria-hidden="true" />
              Enviar agora
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Automações"
          action={
            <span className="text-xs text-muted-foreground">
              {automations.filter((automation) => automation.enabled).length} ativas
            </span>
          }
        />

        <ul className="flex flex-col">
          {automations.map((automation) => (
            <li key={automation.id} className="border-b border-border last:border-b-0">
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-sm font-semibold text-card-foreground">{automation.label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{automation.description}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{automation.scheduleLabel}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Modelo: {templateById(automation.templateId).label}
                    </span>
                  </span>
                </div>

                {/* O nome da automação já está visível ao lado, então o rótulo
                    do interruptor fica apenas para leitores de tela. */}
                <Switch
                  checked={automation.enabled}
                  onChange={(event) => onToggle(automation.id, event.target.checked)}
                  label={`Ativar ${automation.label}`}
                  hideLabel
                  className="mt-0.5 shrink-0"
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Dialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Destinatários da cobrança"
        description={`${billingRecipients.length} alunos · ${formatCurrency(billingTotal)}`}
        footer={
          <button type="button" onClick={() => setPreviewOpen(false)} className={dialogButtonClass.primary}>
            Fechar
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          {billingRecipients.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum aluno com valor em aberto. Nada será enviado.
            </p>
          ) : (
            <ul className="flex flex-col">
              {billingRecipients.map((recipient) => (
                <li
                  key={recipient.customerId}
                  className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">{recipient.customerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPhone(recipient.phone)} ·{" "}
                      {recipient.chargeIds.length === 1
                        ? "1 cobrança"
                        : `${recipient.chargeIds.length} cobranças`}
                    </span>
                  </span>

                  <span className="shrink-0 text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(recipient.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {whatsappIsMocked ? (
            <p className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2.5 text-xs leading-relaxed text-warning-strong">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              O disparo automático entra em operação quando a API do WhatsApp for conectada. Até lá, use
              &quot;Enviar agora&quot; para revisar e mandar pelo seu aparelho.
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  )
}
