"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { sendMessage, waMeLink, whatsappIsMocked } from "@/lib/whatsapp"
import type { WhatsAppMessage, WhatsAppTemplateId } from "@assistpro/types"
import { formatPhone, Textarea } from "@assistpro/ui"
import { Check, ExternalLink, Info, Send } from "lucide-react"
import { useEffect, useState } from "react"

export interface WhatsAppTarget {
  customerId: string
  customerName: string
  phone: string
  templateId: WhatsAppTemplateId
  body: string
  chargeId?: string | null
  appointmentId?: string | null
  /** Quantos destinatários serão atingidos, quando o disparo é em lote. */
  recipientCount?: number
}

/**
 * Modal único de envio de WhatsApp, reutilizado por Financeiro, Inadimplência,
 * Comunicações e Agenda. O texto fica editável porque o profissional
 * frequentemente quer ajustar um detalhe antes de mandar.
 */
export function SendWhatsAppDialog({
  target,
  onClose,
  onSent,
}: {
  target: WhatsAppTarget | null
  onClose: () => void
  onSent?: (message: WhatsAppMessage) => void
}) {
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Recarrega o texto sempre que o destinatário muda.
  useEffect(() => {
    if (target) {
      setBody(target.body)
      setSent(false)
    }
  }, [target])

  async function handleSend() {
    if (!target || sending) return

    setSending(true)

    try {
      const message = await sendMessage(
        {
          customerId: target.customerId,
          templateId: target.templateId,
          body,
          chargeId: target.chargeId ?? null,
          appointmentId: target.appointmentId ?? null,
        },
        { id: target.customerId, name: target.customerName, phone: target.phone },
      )

      onSent?.(message)
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  const isBatch = (target?.recipientCount ?? 1) > 1

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={isBatch ? "Cobrar no WhatsApp" : "Enviar no WhatsApp"}
      description={
        target
          ? isBatch
            ? `${target.recipientCount} destinatários`
            : `${target.customerName} · ${formatPhone(target.phone)}`
          : undefined
      }
      footer={
        <>
          <button type="button" onClick={onClose} className={dialogButtonClass.secondary}>
            {sent ? "Fechar" : "Cancelar"}
          </button>

          {target && !isBatch ? (
            <a
              href={waMeLink(target.phone, body)}
              target="_blank"
              rel="noreferrer"
              className={dialogButtonClass.secondary}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir no WhatsApp
            </a>
          ) : null}

          <button type="button" onClick={handleSend} disabled={sending || sent} className={dialogButtonClass.primary}>
            {sent ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Enviado
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" />
                {sending ? "Enviando..." : "Enviar"}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label htmlFor="whatsapp-body" className="text-sm font-medium text-foreground">
          Mensagem
        </label>

        <Textarea
          id="whatsapp-body"
          rows={8}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="font-normal"
        />

        {whatsappIsMocked ? (
          <p className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2.5 text-xs leading-relaxed text-warning-strong">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Envio simulado nesta versão: a mensagem entra no histórico, mas não sai de verdade.
            {isBatch
              ? " Quando a API oficial estiver ligada, o disparo em lote acontece automaticamente."
              : ' Use "Abrir no WhatsApp" para enviar agora pelo seu aparelho.'}
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
