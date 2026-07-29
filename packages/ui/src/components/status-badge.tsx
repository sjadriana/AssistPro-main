import type { AppointmentStatus } from "@assistpro/types"
import type { PaymentStatus } from "@assistpro/types"
import { cn } from "../lib/cn"

const appointmentStyles: Record<AppointmentStatus, string> = {
  CONFIRMADO: "bg-success-soft text-success-strong",
  AGUARDANDO: "bg-warning-soft text-warning-strong",
  CANCELADO: "bg-danger-soft text-danger-strong",
  CONCLUIDO: "bg-muted text-muted-foreground",
  LIVRE: "bg-muted text-muted-foreground",
}

const appointmentLabels: Record<AppointmentStatus, string> = {
  CONFIRMADO: "Confirmado",
  AGUARDANDO: "Aguardando",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
  LIVRE: "Livre",
}

const paymentStyles: Record<PaymentStatus, string> = {
  PAGO: "bg-success-soft text-success-strong",
  PENDENTE: "bg-warning-soft text-warning-strong",
  ATRASADO: "bg-danger-soft text-danger-strong",
  CANCELADO: "bg-muted text-muted-foreground",
}

const paymentLabels: Record<PaymentStatus, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
}

export function AppointmentBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        appointmentStyles[status],
        className,
      )}
    >
      {appointmentLabels[status]}
    </span>
  )
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        paymentStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {paymentLabels[status]}
    </span>
  )
}
