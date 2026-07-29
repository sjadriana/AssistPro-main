"use client"

import { addMessage, getMessages, subscribeMessages } from "@/lib/message-store"
import { charges } from "@/lib/mock/finance"
import { automations as initialAutomations, whatsappTemplates } from "@/lib/mock/messaging"
import { customers } from "@/lib/mock/customers"
import { balanceVars, buildBillingRunPreview, renderTemplate } from "@/lib/whatsapp"
import type { Automation, WhatsAppTemplate, WhatsAppTemplateId } from "@assistpro/types"
import { cn } from "@assistpro/ui"
import { useMemo, useState, useSyncExternalStore } from "react"
import { AutomationsTab } from "./automations-tab"
import { MessagesTab } from "./messages-tab"
import { SendWhatsAppDialog, type WhatsAppTarget } from "./send-whatsapp-dialog"
import { TemplatesTab } from "./templates-tab"

const tabs = [
  { id: "mensagens", label: "Mensagens" },
  { id: "automacoes", label: "Automações" },
  { id: "modelos", label: "Modelos" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function CommunicationsView() {
  const [tab, setTab] = useState<TabId>("mensagens")
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations)
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(whatsappTemplates)
  const [whatsappTarget, setWhatsappTarget] = useState<WhatsAppTarget | null>(null)

  // Lê o histórico compartilhado, então uma cobrança criada no Financeiro
  // aparece aqui na mesma sessão.
  const messages = useSyncExternalStore(subscribeMessages, getMessages, getMessages)

  const billingRecipients = useMemo(() => buildBillingRunPreview(charges, customers), [])

  function handleToggle(id: string, enabled: boolean) {
    setAutomations((current) =>
      current.map((automation) => (automation.id === id ? { ...automation, enabled } : automation)),
    )
  }

  function handleSaveTemplate(id: WhatsAppTemplateId, body: string) {
    setTemplates((current) => current.map((template) => (template.id === id ? { ...template, body } : template)))
  }

  /** Abre o lote da régua com o texto do primeiro devedor como amostra. */
  function handleSendNow() {
    const first = billingRecipients[0]
    if (!first) return

    const template = templates.find((item) => item.id === "COBRANCA") ?? templates[0]

    setWhatsappTarget({
      customerId: first.customerId,
      customerName: first.customerName,
      phone: first.phone,
      templateId: template.id,
      body: renderTemplate(template.body, balanceVars(first.customerName, first.amount, first.dueDate, null)),
      recipientCount: billingRecipients.length,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Seções de comunicações" className="flex gap-1 border-b border-border">
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

      {tab === "mensagens" ? <MessagesTab messages={messages} /> : null}

      {tab === "automacoes" ? (
        <AutomationsTab
          automations={automations}
          billingRecipients={billingRecipients}
          onToggle={handleToggle}
          onSendNow={handleSendNow}
        />
      ) : null}

      {tab === "modelos" ? <TemplatesTab templates={templates} onSave={handleSaveTemplate} /> : null}

      <SendWhatsAppDialog
        target={whatsappTarget}
        onClose={() => setWhatsappTarget(null)}
        onSent={(message) => addMessage(message)}
      />
    </div>
  )
}
