"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { asaasIsMocked } from "@/lib/asaas"
import { parseAmountToCents, REFERENCE_TODAY } from "@/lib/finance"
import { customers } from "@/lib/mock/customers"
import type { CreateChargeInput } from "@assistpro/types"
import { Checkbox, Field, formatDate, Input, Select } from "@assistpro/ui"
import { Check, Copy, ExternalLink, Info } from "lucide-react"
import { useState } from "react"

export interface CreatedChargeResult {
  invoiceUrl: string
  customerName: string
  amount: number
  dueDate: string
  whatsappSent: boolean
}

export function NewChargeDialog({
  open,
  onOpenChange,
  onSubmit,
  result,
  defaultCustomerId,
  submitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateChargeInput) => void
  /** Preenchido pelo pai após o gateway responder — troca o modal para a confirmação. */
  result: CreatedChargeResult | null
  defaultCustomerId?: string
  submitting: boolean
}) {
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? customers[0].id)
  const [description, setDescription] = useState("")
  const [amountText, setAmountText] = useState("")
  const [dueDate, setDueDate] = useState(REFERENCE_TODAY)
  const [recurring, setRecurring] = useState(false)
  const [errors, setErrors] = useState<{ description?: string; amount?: string }>({})
  const [copied, setCopied] = useState(false)

  const amount = parseAmountToCents(amountText)

  function handleSubmit() {
    const nextErrors: { description?: string; amount?: string } = {}
    if (!description.trim()) nextErrors.description = "Informe uma descrição."
    if (amount <= 0) nextErrors.amount = "Informe um valor maior que zero."

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      customerId,
      description: description.trim(),
      amount,
      dueDate,
      billingType: "PIX",
      appointmentId: null,
      sendWhatsAppNow: true,
    })
  }

  async function copyLink() {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result.invoiceUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard bloqueado: o link continua visível para cópia manual.
      setCopied(false)
    }
  }

  if (result) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title="Cobrança criada"
        description={result.customerName}
        footer={
          <button type="button" onClick={() => onOpenChange(false)} className={dialogButtonClass.primary}>
            Concluir
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 rounded-xl border border-border bg-secondary px-3.5 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Vencimento</dt>
              <dd className="font-medium text-foreground">{formatDate(result.dueDate)}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Link de pagamento</span>

            <p className="rounded-xl border border-border bg-secondary px-3 py-2.5 font-mono text-[11px] leading-relaxed break-all text-muted-foreground">
              {result.invoiceUrl}
            </p>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyLink} className={`${dialogButtonClass.secondary} flex-1`}>
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden="true" />
                    Copiar link
                  </>
                )}
              </button>

              <a
                href={result.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className={`${dialogButtonClass.secondary} flex-1`}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Abrir fatura
              </a>
            </div>
          </div>

          {result.whatsappSent ? (
            <p className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-xs leading-relaxed text-success-strong">
              <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Mensagem de cobrança enviada para {result.customerName.split(" ")[0]} e registrada no histórico.
            </p>
          ) : null}

          {asaasIsMocked ? (
            <p className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2.5 text-xs leading-relaxed text-warning-strong">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Cobrança simulada: a conta Asaas ainda não está conectada, então o link não recebe pagamento real.
            </p>
          ) : null}
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nova cobrança"
      description="Gera o link de pagamento para um cliente"
      footer={
        <>
          <button type="button" onClick={() => onOpenChange(false)} className={dialogButtonClass.secondary}>
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting} className={dialogButtonClass.primary}>
            {submitting ? "Criando..." : "Criar cobrança"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Cliente" htmlFor="charge-customer">
          <Select id="charge-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Descrição" htmlFor="charge-description" error={errors.description}>
          <Input
            id="charge-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Aula extra de sábado"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? "charge-description-error" : undefined}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor" htmlFor="charge-amount" error={errors.amount}>
            <Input
              id="charge-amount"
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={errors.amount ? "charge-amount-error" : undefined}
            />
          </Field>

          <Field label="Vencimento" htmlFor="charge-due">
            <Input
              id="charge-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
          </Field>
        </div>

        <Checkbox
          label="Cobrança recorrente (mensal)"
          checked={recurring}
          onChange={(event) => setRecurring(event.target.checked)}
        />
      </div>
    </Dialog>
  )
}
