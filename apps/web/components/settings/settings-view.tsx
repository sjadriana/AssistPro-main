"use client"

import { ServiceList } from "@/components/services/service-list"
import { asaasIsMocked, billingTypeLabels } from "@/lib/asaas"
import { nextBillingDay } from "@/lib/finance"
import { pixKey } from "@/lib/mock/finance"
import { businessHours } from "@/lib/mock/services"
import { whatsappIsMocked } from "@/lib/whatsapp"
import type { BillingType } from "@assistpro/types"
import { Badge, Card, CardBody, CardHeader, cn, Field, formatDate, Input, Select, Switch } from "@assistpro/ui"
import { Info } from "lucide-react"
import { useState } from "react"

type Tab = "servicos" | "cobranca" | "horarios"

const tabs: { value: Tab; label: string }[] = [
  { value: "servicos",  label: "Serviços"  },
  { value: "cobranca",  label: "Cobrança"  },
  { value: "horarios",  label: "Horários"  },
]

const weekdayNames: Record<string, string> = {
  SEG: "Segunda",
  TER: "Terça",
  QUA: "Quarta",
  QUI: "Quinta",
  SEX: "Sexta",
  SAB: "Sábado",
  DOM: "Domingo",
}

/**
 * Configurações do negócio. Os valores ficam em estado local porque ainda não
 * existe persistência — a tela serve para definir o formato dos dados que a
 * integração real vai gravar.
 */
export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>("servicos")
  const [pixKeyValue, setPixKeyValue] = useState(pixKey)
  const [billingDay, setBillingDay] = useState(30)
  const [defaultBillingType, setDefaultBillingType] = useState<BillingType>("PIX")
  const [lateFee, setLateFee] = useState("2")
  const [interest, setInterest] = useState("1")
  const [autoCharge, setAutoCharge] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Serviços, cobrança e horários de atendimento.
        </p>
      </header>

      {/* Tab bar */}
      <nav
        role="tablist"
        aria-label="Seções de configuração"
        className="flex gap-1 rounded-xl border border-border bg-secondary p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Aba: Serviços ─────────────────────────────────────────────────── */}
      {activeTab === "servicos" ? (
        <Card>
          <CardHeader
            title="Serviços"
            description="Gerencie os serviços que você oferece e como eles aparecem nos agendamentos."
          />
          <CardBody>
            <ServiceList />
          </CardBody>
        </Card>
      ) : null}

      {/* ── Aba: Cobrança ─────────────────────────────────────────────────── */}
      {activeTab === "cobranca" ? <>
      <Card>
        <CardHeader title="Integrações" description="Conecte as contas para sair do modo simulado" />

        <CardBody className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">Asaas</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Gera os links de cobrança por PIX, boleto e cartão de crédito.
              </span>
            </div>

            <Badge tone={asaasIsMocked ? "warning" : "success"}>{asaasIsMocked ? "Simulado" : "Conectado"}</Badge>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">WhatsApp</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Envio de cobranças, lembretes e horários livres.
              </span>
            </div>

            <Badge tone={whatsappIsMocked ? "warning" : "success"}>
              {whatsappIsMocked ? "Simulado" : "Conectado"}
            </Badge>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-secondary px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            As chaves de API ainda não foram cadastradas. Enquanto isso, cobranças e mensagens são simuladas e ficam
            registradas normalmente no sistema.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cobrança" description="Padrões aplicados às novas cobranças" />

        <CardBody className="flex flex-col gap-4">
          <Field label="Chave PIX" htmlFor="pix-key" hint="Usada no QR Code e no copia-e-cola.">
            <Input id="pix-key" value={pixKeyValue} onChange={(event) => setPixKeyValue(event.target.value)} />
          </Field>

          <Field label="Forma de cobrança padrão" htmlFor="default-billing">
            <Select
              id="default-billing"
              value={defaultBillingType}
              onChange={(event) => setDefaultBillingType(event.target.value as BillingType)}
            >
              {(Object.keys(billingTypeLabels) as BillingType[]).map((type) => (
                <option key={type} value={type}>
                  {billingTypeLabels[type]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Multa por atraso (%)" htmlFor="late-fee">
              <Input
                id="late-fee"
                inputMode="decimal"
                value={lateFee}
                onChange={(event) => setLateFee(event.target.value)}
              />
            </Field>

            <Field label="Juros ao mês (%)" htmlFor="interest">
              <Input
                id="interest"
                inputMode="decimal"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cobrança automática" description="Disparo mensal dos valores em aberto no WhatsApp" />

        <CardBody className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">Enviar cobrança automaticamente</span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                Próximo disparo em {formatDate(nextBillingDay(undefined, billingDay))}.
              </span>
            </div>

            <Switch
              checked={autoCharge}
              onChange={(event) => setAutoCharge(event.target.checked)}
              label="Enviar cobrança automaticamente"
              hideLabel
              className="mt-0.5 shrink-0"
            />
          </div>

          <Field
            label="Dia do mês"
            htmlFor="billing-day"
            hint="Em meses mais curtos, o envio cai no último dia do mês."
          >
            <Select
              id="billing-day"
              value={String(billingDay)}
              onChange={(event) => setBillingDay(Number(event.target.value))}
              disabled={!autoCharge}
            >
              {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>
                  Dia {day}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      </> : null}

      {/* ── Aba: Horários ─────────────────────────────────────────────────── */}
      {activeTab === "horarios" ? (
        <Card>
          <CardHeader title="Horário de atendimento" description="Base para os horários livres oferecidos aos clientes" />

          <CardBody>
            <ul className="flex flex-col gap-2">
              {businessHours.map((entry) => (
                <li key={entry.weekday} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{weekdayNames[entry.weekday]}</span>

                  {entry.enabled ? (
                    <span className="text-muted-foreground tabular-nums">
                      {entry.from} às {entry.to}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Fechado</span>
                  )}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  )
}
