"use client"

import { SendWhatsAppDialog, type WhatsAppTarget } from "@/components/messaging/send-whatsapp-dialog"
import * as asaas from "@/lib/asaas"
import {
  buildPixPayload,
  createCharge,
  filterByPeriod,
  filterCharges,
  markAsPaid,
  openBalancesByCustomer,
  recalculateSummary,
} from "@/lib/finance"
import { addMessage } from "@/lib/message-store"
import { customers } from "@/lib/mock/customers"
import { charges as initialCharges, financeSummary, pixKey } from "@/lib/mock/finance"
import { templateById } from "@/lib/mock/messaging"
import { balanceVars, chargeVars, renderTemplate, sendMessage } from "@/lib/whatsapp"
import type {
  Charge,
  CreateChargeInput,
  FinanceFilters,
  OpenCustomerBalance,
  RegisterPaymentInput,
} from "@assistpro/types"
import { useMemo, useState } from "react"
import { ChargeList } from "./charge-list"
import { FinanceSummaryCards } from "./finance-summary-cards"
import { NewChargeDialog, type CreatedChargeResult } from "./new-charge-dialog"
import { OverduePanel } from "./overdue-panel"
import { PixDialog } from "./pix-dialog"
import { RegisterPaymentDialog } from "./register-payment-dialog"

const OVERDUE_PANEL_ID = "painel-inadimplencia"

export function FinanceView() {
  const [charges, setCharges] = useState<Charge[]>(initialCharges)
  const [filters, setFilters] = useState<FinanceFilters>({ period: "ESTE_MES", status: "TODOS" })
  const [paymentTarget, setPaymentTarget] = useState<Charge | null>(null)
  const [pixTarget, setPixTarget] = useState<Charge | null>(null)
  const [overdueOpen, setOverdueOpen] = useState(false)
  const [newChargeOpen, setNewChargeOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createdResult, setCreatedResult] = useState<CreatedChargeResult | null>(null)
  const [whatsappTarget, setWhatsappTarget] = useState<WhatsAppTarget | null>(null)

  // O resumo acompanha o período, mas ignora o filtro de status: os três cards
  // precisam somar o total do período, não só a fatia visível na lista.
  const summary = useMemo(
    () => recalculateSummary(filterByPeriod(charges, filters.period), financeSummary.changeVsPreviousPeriod),
    [charges, filters.period],
  )

  const visibleCharges = useMemo(() => filterCharges(charges, filters), [charges, filters])

  // Sobre TODAS as cobranças, de propósito: um atraso de março precisa aparecer
  // mesmo quando o filtro da tela está em "este mês".
  const balances = useMemo(() => openBalancesByCustomer(charges, customers), [charges])

  const pix = useMemo(() => (pixTarget ? buildPixPayload(pixTarget, pixKey) : null), [pixTarget])

  function handleConfirmPayment(input: RegisterPaymentInput) {
    setCharges((current) => markAsPaid(current, input))
    setPaymentTarget(null)
  }

  /** Monta o texto de cobrança de uma única parcela. */
  function openChargeWhatsApp(charge: Charge) {
    const customer = customers.find((item) => item.id === charge.customerId)
    if (!customer) return

    const isLate = charge.status === "ATRASADO"
    const template = templateById(isLate ? "COBRANCA_ATRASO" : "COBRANCA")

    setWhatsappTarget({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      templateId: template.id,
      body: renderTemplate(template.body, chargeVars(charge, customer.name)),
      chargeId: charge.id,
    })
  }

  /** Cobrança consolidada: um cliente com três parcelas recebe uma mensagem só. */
  function openBalanceWhatsApp(balance: OpenCustomerBalance) {
    const template = templateById(balance.daysLate > 0 ? "COBRANCA_ATRASO" : "COBRANCA")
    const link = balance.charges.find((charge) => charge.invoiceUrl)?.invoiceUrl ?? null

    setWhatsappTarget({
      customerId: balance.customerId,
      customerName: balance.customerName,
      phone: balance.phone,
      templateId: template.id,
      body: renderTemplate(
        template.body,
        balanceVars(balance.customerName, balance.totalOpen, balance.oldestDueDate, link),
      ),
    })
  }

  /**
   * Disparo em lote. O texto exibido é o do primeiro devedor, apenas como
   * amostra — na régua real cada cliente recebe o seu com as próprias variáveis.
   */
  function openBatchWhatsApp() {
    const first = balances[0]
    if (!first) return

    const template = templateById("COBRANCA")

    setWhatsappTarget({
      customerId: first.customerId,
      customerName: first.customerName,
      phone: first.phone,
      templateId: template.id,
      body: renderTemplate(template.body, balanceVars(first.customerName, first.totalOpen, first.oldestDueDate, null)),
      recipientCount: balances.length,
    })
  }

  async function handleCreateCharge(input: CreateChargeInput) {
    setCreating(true)

    try {
      const customer = customers.find((item) => item.id === input.customerId)
      if (!customer) return

      const response = await asaas.createCharge(input)
      const created = createCharge(input, customer.name, response)

      setCharges((current) => [created, ...current])

      if (input.sendWhatsAppNow) {
        const template = templateById("COBRANCA")
        const message = await sendMessage(
          {
            customerId: customer.id,
            templateId: template.id,
            body: renderTemplate(template.body, chargeVars(created, customer.name)),
            chargeId: created.id,
          },
          customer,
        )

        addMessage(message)
      }

      setCreatedResult({
        invoiceUrl: response.invoiceUrl,
        customerName: customer.name,
        amount: input.amount,
        dueDate: input.dueDate,
        whatsappSent: input.sendWhatsAppNow,
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FinanceSummaryCards
        summary={summary}
        openCount={balances.length}
        overdueExpanded={overdueOpen}
        onToggleOverdue={() => setOverdueOpen((current) => !current)}
      />

      {overdueOpen ? (
        <OverduePanel
          id={OVERDUE_PANEL_ID}
          balances={balances}
          onChargeWhatsApp={openBalanceWhatsApp}
          onChargeAllWhatsApp={openBatchWhatsApp}
          onRegisterPayment={setPaymentTarget}
        />
      ) : null}

      <ChargeList
        charges={visibleCharges}
        filters={filters}
        onFiltersChange={setFilters}
        onRegisterPayment={setPaymentTarget}
        onChargePix={setPixTarget}
        onNewCharge={() => setNewChargeOpen(true)}
        onSendWhatsApp={openChargeWhatsApp}
      />

      {/* A key remonta o formulário a cada cobrança, zerando forma e data escolhidas. */}
      <RegisterPaymentDialog
        key={paymentTarget?.id ?? "none"}
        charge={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={handleConfirmPayment}
      />

      <PixDialog charge={pixTarget} pix={pix} onClose={() => setPixTarget(null)} />

      {/* A key limpa os campos entre uma criação e a próxima. */}
      <NewChargeDialog
        key={createdResult ? "result" : "form"}
        open={newChargeOpen}
        onOpenChange={(open) => {
          setNewChargeOpen(open)
          if (!open) setCreatedResult(null)
        }}
        onSubmit={handleCreateCharge}
        result={createdResult}
        submitting={creating}
      />

      <SendWhatsAppDialog
        target={whatsappTarget}
        onClose={() => setWhatsappTarget(null)}
        onSent={(message) => addMessage(message)}
      />
    </div>
  )
}
