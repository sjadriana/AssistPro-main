import { SettingsView } from "@/components/settings/settings-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configurações — assist",
  description: "Integrações de cobrança e WhatsApp, padrões financeiros e horário de atendimento.",
}

export default function SettingsPage() {
  return <SettingsView />
}
