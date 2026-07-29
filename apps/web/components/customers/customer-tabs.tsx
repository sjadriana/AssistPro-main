"use client"

import type { Appointment, Charge, Customer } from "@assistpro/types"
import {
  AppointmentBadge,
  Card,
  CardBody,
  CardHeader,
  cn,
  formatCurrency,
  formatDate,
  formatPhone,
  formatTime,
  PaymentBadge,
} from "@assistpro/ui"
import { Pencil } from "lucide-react"
import { useState } from "react"

const tabs = [
  { id: "geral", label: "Geral" },
  { id: "historico", label: "Histórico" },
  { id: "financeiro", label: "Financeiro" },
  { id: "observacoes", label: "Observações" },
] as const

type TabId = (typeof tabs)[number]["id"]

const periodLabels = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
} as const

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-card-foreground">{value}</dd>
    </div>
  )
}

export function CustomerTabs({
  customer,
  appointments,
  charges,
}: {
  customer: Customer
  appointments: Appointment[]
  charges: Charge[]
}) {
  const [tab, setTab] = useState<TabId>("geral")

  const totalPaid = charges
    .filter((charge) => charge.status === "PAGO")
    .reduce((sum, charge) => sum + charge.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Seções do cliente" className="flex gap-1 border-b border-border">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "geral" ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Informações" />
            <CardBody className="py-1">
              <dl className="flex flex-col">
                <InfoRow label="Telefone" value={formatPhone(customer.phone)} />
                <InfoRow label="E-mail" value={customer.email ?? "Não informado"} />
                <InfoRow
                  label="Data de nascimento"
                  value={customer.birthDate ? formatDate(customer.birthDate) : "Não informada"}
                />
                <InfoRow label="Endereço" value={customer.address ?? "Não informado"} />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Preferências" />
            <CardBody className="py-1">
              <dl className="flex flex-col">
                <InfoRow
                  label="Serviço preferido"
                  value={customer.preferences.preferredServiceName ?? "Não informado"}
                />
                <InfoRow
                  label="Horário preferido"
                  value={
                    customer.preferences.preferredPeriod
                      ? periodLabels[customer.preferences.preferredPeriod]
                      : "Não informado"
                  }
                />
                <InfoRow
                  label="Dias disponíveis"
                  value={
                    customer.preferences.availableDays.length > 0
                      ? customer.preferences.availableDays.join(", ")
                      : "Não informados"
                  }
                />
              </dl>
            </CardBody>
          </Card>

          {customer.customFields.length > 0 ? (
            <Card>
              <CardHeader title="Campos personalizados" />
              <CardBody className="py-1">
                <dl className="flex flex-col">
                  {customer.customFields.map((field) => (
                    <InfoRow key={field.key} label={field.label} value={field.value} />
                  ))}
                </dl>
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === "historico" ? (
        <Card>
          <CardHeader title={`Atendimentos (${appointments.length})`} />
          <CardBody className="p-0">
            {appointments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhum atendimento registrado ainda.
              </p>
            ) : (
              <ul className="flex flex-col">
                {appointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-card-foreground">
                        {appointment.serviceName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                      </span>
                    </span>
                    <AppointmentBadge status={appointment.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === "financeiro" ? (
        <Card>
          <CardHeader title="Cobranças" action={<span className="text-xs text-muted-foreground">Pago: {formatCurrency(totalPaid)}</span>} />
          <CardBody className="p-0">
            {charges.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma cobrança registrada.</p>
            ) : (
              <ul className="flex flex-col">
                {charges.map((charge) => (
                  <li
                    key={charge.id}
                    className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-card-foreground">{charge.description}</span>
                      <span className="text-xs text-muted-foreground">Vencimento: {formatDate(charge.dueDate)}</span>
                    </span>
                    <span className="text-sm font-semibold text-card-foreground">{formatCurrency(charge.amount)}</span>
                    <PaymentBadge status={charge.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === "observacoes" ? (
        <Card>
          <CardHeader
            title="Observações"
            action={
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Pencil className="size-4" aria-hidden="true" />
                <span className="sr-only">Editar observações</span>
              </button>
            }
          />
          <CardBody>
            <p className="text-sm leading-relaxed text-card-foreground">
              {customer.notes ?? "Nenhuma observação registrada para este cliente."}
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
