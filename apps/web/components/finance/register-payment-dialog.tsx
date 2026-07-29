"use client"

import { Dialog, dialogButtonClass } from "@/components/ui/dialog"
import { REFERENCE_TODAY } from "@/lib/finance"
import type { Charge, PaymentMethod, RegisterPaymentInput } from "@assistpro/types"
import { Field, formatCurrency, Input, RadioCard } from "@assistpro/ui"
import { ArrowLeftRight, Banknote, CreditCard, QrCode } from "lucide-react"
import { useState } from "react"

const methods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "PIX", label: "PIX", icon: <QrCode className="size-4" aria-hidden="true" /> },
  { value: "DINHEIRO", label: "Dinheiro", icon: <Banknote className="size-4" aria-hidden="true" /> },
  { value: "CARTAO", label: "Cartão", icon: <CreditCard className="size-4" aria-hidden="true" /> },
  {
    value: "TRANSFERENCIA",
    label: "Transferência",
    icon: <ArrowLeftRight className="size-4" aria-hidden="true" />,
  },
]

export function RegisterPaymentDialog({
  charge,
  onClose,
  onConfirm,
}: {
  charge: Charge | null
  onClose: () => void
  onConfirm: (input: RegisterPaymentInput) => void
}) {
  const [method, setMethod] = useState<PaymentMethod>("PIX")
  const [paidAt, setPaidAt] = useState(REFERENCE_TODAY)

  function handleConfirm() {
    if (!charge) return

    onConfirm({ chargeId: charge.id, method, paidAt })
  }

  return (
    <Dialog
      open={charge !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Registrar pagamento"
      description={charge ? `${charge.customerName} · ${charge.description}` : undefined}
      footer={
        <>
          <button type="button" onClick={onClose} className={dialogButtonClass.secondary}>
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} className={dialogButtonClass.primary}>
            Confirmar pagamento
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-2 rounded-xl bg-secondary px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">Valor</span>
          <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
            {charge ? formatCurrency(charge.amount) : null}
          </span>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-foreground">Forma de pagamento</legend>

          <div className="grid grid-cols-2 gap-2">
            {methods.map((option) => (
              <RadioCard
                key={option.value}
                name="payment-method"
                value={option.value}
                label={option.label}
                icon={option.icon}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
              />
            ))}
          </div>
        </fieldset>

        <Field label="Data do pagamento" htmlFor="paid-at">
          <Input
            id="paid-at"
            type="date"
            value={paidAt}
            max={REFERENCE_TODAY}
            onChange={(event) => setPaidAt(event.target.value)}
          />
        </Field>
      </div>
    </Dialog>
  )
}
