"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import type { Charge, PixChargeInfo } from "@assistpro/types"
import { cn, formatCurrency, formatTime } from "@assistpro/ui"
import { Check, Copy, Info, QrCode } from "lucide-react"
import { useState } from "react"

export function PixDialog({
  charge,
  pix,
  onClose,
}: {
  charge: Charge | null
  pix: PixChargeInfo | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copyPayload() {
    if (!pix) return

    try {
      await navigator.clipboard.writeText(pix.payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard bloqueado (permissão ou contexto não seguro): o código segue
      // visível em tela para cópia manual, então não há o que reverter.
      setCopied(false)
    }
  }

  return (
    <Dialog
      open={charge !== null && pix !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Cobrar via PIX"
      description={charge ? `${charge.customerName} · ${charge.description}` : undefined}
      footer={
        <button type="button" onClick={onClose} className={dialogButtonClass.secondary}>
          Fechar
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          {/* Placeholder deliberado: um QR falso poderia ser escaneado e frustrar o cliente. */}
          <div className="flex size-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary">
            <QrCode className="size-8 text-muted-foreground" aria-hidden="true" />
            <span className="text-[10px] font-medium text-muted-foreground">QR indisponível</span>
          </div>

          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {pix ? formatCurrency(pix.amount) : null}
          </span>

          {pix ? (
            <span className="text-xs text-muted-foreground">Expira às {formatTime(pix.expiresAt)}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">PIX copia e cola</span>

          <p className="rounded-xl border border-border bg-secondary px-3 py-2.5 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
            {pix?.payload}
          </p>

          <button
            type="button"
            onClick={copyPayload}
            aria-live="polite"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              copied
                ? "bg-success-soft text-success-strong"
                : dialogButtonClass.primary,
            )}
          >
            {copied ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copiar código
              </>
            )}
          </button>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2.5 text-xs leading-relaxed text-warning-strong">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Cobrança simulada nesta versão. O código não gera pagamento real — ao receber o valor, registre o pagamento
          manualmente.
        </p>
      </div>
    </Dialog>
  )
}
